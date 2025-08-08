/**
 * Professional Progress Service
 * Non-gamified progress tracking focused on completion status and readiness levels
 */

import { supabase } from '@/integrations/supabase/client';

// Minimal row shapes used from Supabase
type ProfileRow = {
  will_updated_at?: string | null;
  has_will?: boolean | null;
  has_executor?: boolean | null;
  has_beneficiaries?: boolean | null;
};

type DocumentRow = {
  id: string;
  category: string;
  created_at: string;
  updated_at?: string | null;
  name?: string | null;
};

type AssetRow = {
  id: string;
  type: string;
  name?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export interface SecurityArea {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'needs_review' | 'complete';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  lastUpdated: string | null;
  reviewNeeded: boolean;
  estimatedTime?: string;
  actionUrl: string;
  description: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

export interface ReadinessLevel {
  level: 'initial' | 'developing' | 'established' | 'comprehensive' | 'maintained';
  label: string;
  description: string;
  color: string;
}

export interface ProgressMetrics {
  totalAreas: number;
  completedAreas: number;
  inProgressAreas: number;
  needsReviewCount: number;
  urgentActionsCount: number;
  lastActivityDate: string | null;
  nextReviewDate: string | null;
  estimatedTimeToComplete: string;
}

export interface ProfessionalProgress {
  readinessLevel: ReadinessLevel;
  securityAreas: SecurityArea[];
  metrics: ProgressMetrics;
  recommendations: Recommendation[];
  timeline: TimelineEvent[];
}

export interface Recommendation {
  id: string;
  type: 'action' | 'review' | 'milestone' | 'update' | 'consultation' | 'insight';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  actionUrl: string;
  dueDate?: string;
  icon: string;
  dismissible?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'completed' | 'started' | 'updated' | 'reviewed' | 'document_added' | 'profile_updated' | 'asset_added';
  area: string;
  description: string;
}

export class ProfessionalProgressService {
  /**
   * Get complete professional progress status
   */
  static async getProfessionalProgress(userId: string): Promise<ProfessionalProgress> {
    const securityAreas = await this.getSecurityAreas(userId);
    const metrics = this.calculateMetrics(securityAreas);
    const readinessLevel = this.determineReadinessLevel(metrics);
    const recommendations = await this.generateRecommendations(userId, securityAreas, metrics);
    const timeline = await this.getActivityTimeline(userId);

    return {
      readinessLevel,
      securityAreas,
      metrics,
      recommendations,
      timeline
    };
  }

  /**
   * Get all security areas with their current status
   */
  static async getSecurityAreas(userId: string): Promise<SecurityArea[]> {
    // Check cache first
    const cacheKey = `prof_progress_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        const cacheAge = Date.now() - parsedCache.timestamp;
        // Return cached data if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000 && parsedCache.areas) {
          return parsedCache.areas;
        }
      } catch (e) {
        // Invalid cache, continue to fetch fresh data
        console.warn('Invalid cache data:', e);
      }
    }

    // Fetch user data from Supabase (tolerant to different mock shapes)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('will_updated_at, has_will, has_executor, has_beneficiaries')
      .eq('id', userId)
      .single();
    const profile: ProfileRow | null = profileData as ProfileRow | null;

    const { data: documents } = await supabase
      .from('documents')
      .select('id, category, created_at, updated_at, name')
      .eq('user_id', userId);

    const { data: assets } = await supabase
      .from('assets')
      .select('id, type, name, created_at, updated_at')
      .eq('user_id', userId);

    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('relationship, created_at')
      .eq('user_id', userId);

    const areas: SecurityArea[] = [
      {
        id: 'identity_documents',
        name: 'Identity & Legal Documents',
        status: this.getAreaStatus(documents?.filter(d => d.category === 'identity').length || 0),
        priority: 'high',
        lastUpdated: this.getLatestDate(documents?.filter(d => d.category === 'identity')),
        reviewNeeded: this.needsReview(documents?.filter(d => d.category === 'identity')),
        estimatedTime: '15 minutes',
        actionUrl: '/vault?category=identity',
        description: 'Essential identification and legal documentation',
        subtasks: [
          { id: 'passport', title: 'Passport or ID', completed: false, required: true },
          { id: 'birth_cert', title: 'Birth Certificate', completed: false, required: true },
          { id: 'ssn', title: 'Social Security Card', completed: false, required: false },
          { id: 'marriage_cert', title: 'Marriage Certificate', completed: false, required: false }
        ]
      },
      {
        id: 'financial_records',
        name: 'Financial Records',
        status: this.getAreaStatus(assets?.filter(a => a.type === 'bank_account' || a.type === 'investment').length || 0),
        priority: 'high',
        lastUpdated: this.getLatestDate(assets?.filter(a => a.type === 'bank_account' || a.type === 'investment')),
        reviewNeeded: this.needsReview(assets?.filter(a => a.type === 'bank_account' || a.type === 'investment')),
        estimatedTime: '20 minutes',
        actionUrl: '/assets',
        description: 'Bank accounts, investments, and financial documentation',
        subtasks: [
          { id: 'primary_bank', title: 'Primary Bank Account', completed: false, required: true },
          { id: 'savings', title: 'Savings Accounts', completed: false, required: false },
          { id: 'investments', title: 'Investment Accounts', completed: false, required: false },
          { id: 'retirement', title: 'Retirement Accounts', completed: false, required: false }
        ]
      },
      {
        id: 'estate_planning',
        name: 'Estate Planning',
        status: this.getEstateStatus(profile),
        priority: this.getEstatePriority(profile),
        lastUpdated: profile?.will_updated_at || null,
        reviewNeeded: this.needsWillReview(profile?.will_updated_at),
        estimatedTime: '45 minutes',
        actionUrl: '/will',
        description: 'Will, trusts, and estate planning documents',
        subtasks: [
          { id: 'will', title: 'Last Will & Testament', completed: profile?.has_will || false, required: true },
          { id: 'executor', title: 'Executor Designated', completed: profile?.has_executor || false, required: true },
          { id: 'beneficiaries', title: 'Beneficiaries Listed', completed: profile?.has_beneficiaries || false, required: true },
          { id: 'power_attorney', title: 'Power of Attorney', completed: false, required: false }
        ]
      },
      {
        id: 'insurance_policies',
        name: 'Insurance Policies',
        status: this.getAreaStatus(documents?.filter(d => d.category === 'insurance').length || 0),
        priority: 'medium',
        lastUpdated: this.getLatestDate(documents?.filter(d => d.category === 'insurance')),
        reviewNeeded: false,
        estimatedTime: '10 minutes',
        actionUrl: '/vault?category=insurance',
        description: 'Life, health, property, and other insurance policies'
      },
      {
        id: 'property_assets',
        name: 'Property & Assets',
        status: this.getAreaStatus(assets?.filter(a => a.type === 'real_estate' || a.type === 'vehicle').length || 0),
        priority: 'medium',
        lastUpdated: this.getLatestDate(assets?.filter(a => a.type === 'real_estate' || a.type === 'vehicle')),
        reviewNeeded: false,
        estimatedTime: '15 minutes',
        actionUrl: '/assets?type=property',
        description: 'Real estate, vehicles, and valuable possessions'
      },
      {
        id: 'family_circle',
        name: 'Family & Beneficiaries',
        status: this.getAreaStatus(familyMembers?.length || 0),
        priority: familyMembers?.length ? 'low' : 'high',
        lastUpdated: this.getLatestDate(familyMembers),
        reviewNeeded: false,
        estimatedTime: '10 minutes',
        actionUrl: '/family-hub',
        description: 'Family members, beneficiaries, and trusted contacts',
        subtasks: [
          { id: 'spouse', title: 'Spouse/Partner', completed: false, required: false },
          { id: 'children', title: 'Children', completed: false, required: false },
          { id: 'emergency', title: 'Emergency Contact', completed: profile?.has_emergency_contacts || false, required: true },
          { id: 'executor_contact', title: 'Executor Contact', completed: profile?.has_executor || false, required: true }
        ]
      },
      {
        id: 'medical_directives',
        name: 'Medical Directives',
        status: this.getAreaStatus(documents?.filter(d => d.category === 'medical').length || 0),
        priority: 'medium',
        lastUpdated: this.getLatestDate(documents?.filter(d => d.category === 'medical')),
        reviewNeeded: false,
        estimatedTime: '20 minutes',
        actionUrl: '/vault?category=medical',
        description: 'Healthcare directives, medical history, and emergency medical information'
      },
      {
        id: 'digital_assets',
        name: 'Digital Assets & Accounts',
        status: 'not_started', // Would need specific tracking
        priority: 'low',
        lastUpdated: null,
        reviewNeeded: false,
        estimatedTime: '30 minutes',
        actionUrl: '/vault?category=digital',
        description: 'Online accounts, digital subscriptions, and cryptocurrency'
      },
      {
        id: 'legacy_messages',
        name: 'Legacy Messages',
        status: profile?.has_legacy_letters ? 'complete' : 'not_started',
        priority: 'low',
        lastUpdated: null,
        reviewNeeded: false,
        estimatedTime: '15 minutes',
        actionUrl: '/legacy-letters',
        description: 'Personal messages and instructions for loved ones'
      }
    ];

    // Update subtask completion status based on actual data
    areas.forEach(area => {
      if (area.subtasks) {
        area.subtasks = this.updateSubtaskStatus(area, profile, documents, assets, familyMembers);
      }
    });

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        areas,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to cache areas:', e);
    }

    return areas;
  }

  /**
   * Update subtask completion status based on actual data
   */
  private static updateSubtaskStatus(
    area: SecurityArea,
    profile: Record<string, unknown> | null,
    documents: Array<{ category?: string; created_at?: string; updated_at?: string }> | undefined,
    assets: Array<{ type?: string; created_at?: string; updated_at?: string }> | undefined,
    familyMembers: Array<{ relationship?: string; created_at?: string }> | undefined
  ): SubTask[] {
    if (!area.subtasks) return [];

    return area.subtasks.map(subtask => {
      let completed = subtask.completed;

      // Check specific subtasks based on area and data
      if (area.id === 'identity_documents') {
        if (subtask.id === 'passport') {
          completed = documents?.some(d => d.category === 'identity') || false;
        }
      } else if (area.id === 'financial_records') {
        if (subtask.id === 'primary_bank') {
          completed = assets?.some(a => a.type === 'bank_account') || false;
        } else if (subtask.id === 'investments') {
          completed = assets?.some(a => a.type === 'investment') || false;
        }
      } else if (area.id === 'family_circle') {
        if (subtask.id === 'spouse') {
          completed = familyMembers?.some(m => m.relationship === 'spouse') || false;
        } else if (subtask.id === 'children') {
          completed = familyMembers?.some(m => m.relationship === 'child') || false;
        }
      }

      return { ...subtask, completed };
    });
  }

  /**
   * Determine area status based on item count
   */
  private static getAreaStatus(itemCount: number): SecurityArea['status'] {
    if (itemCount === 0) return 'not_started';
    if (itemCount <= 2) return 'in_progress';
    return 'complete';
  }

  /**
   * Determine estate planning status based on profile data
   */
  private static getEstateStatus(profile: Record<string, unknown> | null): SecurityArea['status'] {
    if (!profile) return 'not_started';
    
    const hasWill = profile.has_will || false;
    const hasExecutor = profile.has_executor || false;
    const hasBeneficiaries = profile.has_beneficiaries || false;
    
    const completedCount = [hasWill, hasExecutor, hasBeneficiaries].filter(Boolean).length;
    
    if (completedCount === 0) return 'not_started';
    if (completedCount === 3) return 'complete';
    return 'in_progress';
  }

  /**
   * Determine estate planning priority based on profile data
   */
  private static getEstatePriority(profile: Record<string, unknown> | null): SecurityArea['priority'] {
    if (!profile || !profile.has_will) return 'urgent';
    // If has will but not all items completed, it's still high priority; if fully complete, low
    const hasExecutor = profile.has_executor || false;
    const hasBeneficiaries = profile.has_beneficiaries || false;
    const completedCount = [true, hasExecutor, hasBeneficiaries].filter(Boolean).length;
    return completedCount === 3 ? 'low' : 'high';
  }

  /**
   * Get the latest date from a list of items
   */
  private static getLatestDate(items?: Array<{ created_at?: string; updated_at?: string }> | null): string | null {
    if (!items || items.length === 0) return null;
    
    const dates = items
      .map(item => item.updated_at || item.created_at)
      .filter(date => date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    return dates[0] || null;
  }

  /**
   * Check if documents need review (older than 1 year)
   */
  private static needsReview(items?: Array<{ created_at?: string; updated_at?: string }> | null): boolean {
    if (!items || items.length === 0) return false;
    
    const latestDate = this.getLatestDate(items);
    if (!latestDate) return false;
    
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceUpdate > 365;
  }

  /**
   * Check if will needs review
   */
  private static needsWillReview(lastUpdated?: string): boolean {
    if (!lastUpdated) return false;
    
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Will should be reviewed every 3 years or after major life events
    return daysSinceUpdate > 1095; // 3 years
  }

  /**
   * Calculate progress metrics
   */
  static calculateMetrics(areas: SecurityArea[]): ProgressMetrics {
    const completedAreas = areas.filter(a => a.status === 'complete').length;
    const inProgressAreas = areas.filter(a => a.status === 'in_progress').length;
    const needsReviewCount = areas.filter(a => a.reviewNeeded).length;
    const urgentActionsCount = areas.filter(a => a.priority === 'urgent' && a.status !== 'complete').length;

    // Calculate estimated time to complete
    const totalMinutes = areas
      .filter(a => a.status !== 'complete')
      .reduce((total, area) => {
        // Parse minutes from string - handles both "10 minutes" and "10"
        let minutes = 0;
        if (area.estimatedTime) {
          const match = area.estimatedTime.match(/^-?\d+/);
          if (match) {
            const parsed = parseInt(match[0]);
            minutes = parsed > 0 ? parsed : 0; // Only positive values
          }
        }
        return total + minutes;
      }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let estimatedTimeToComplete = '';
    
    if (hours > 0 && minutes > 0) {
      estimatedTimeToComplete = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    } else if (hours > 0) {
      estimatedTimeToComplete = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      estimatedTimeToComplete = `${minutes} minutes`;
    }

    // Get last activity date
    const allDates = areas
      .map(a => a.lastUpdated)
      .filter((date): date is string => Boolean(date))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const lastActivityDate = allDates[0] || null;

    // Calculate next review date (1 year from last activity)
    let nextReviewDate = null;
    if (lastActivityDate) {
      const nextReview = new Date(lastActivityDate);
      nextReview.setFullYear(nextReview.getFullYear() + 1);
      nextReviewDate = nextReview.toISOString();
    }

    return {
      totalAreas: areas.length,
      completedAreas,
      inProgressAreas,
      needsReviewCount,
      urgentActionsCount,
      lastActivityDate,
      nextReviewDate,
      estimatedTimeToComplete
    };
  }

  /**
   * Determine readiness level based on metrics
   */
  static determineReadinessLevel(metrics: ProgressMetrics): ReadinessLevel {
    const completionPercentage = metrics.totalAreas > 0 
      ? (metrics.completedAreas / metrics.totalAreas) * 100
      : 0;

    if (completionPercentage === 100 && metrics.needsReviewCount === 0) {
      return {
        level: 'maintained',
        label: 'Fully Maintained',
        description: 'All areas complete and up-to-date',
        color: 'green'
      };
    } else if (completionPercentage >= 80) {
      return {
        level: 'comprehensive',
        label: 'Comprehensive',
        description: 'Most security areas are well-established',
        color: 'blue'
      };
    } else if (completionPercentage >= 60) {
      return {
        level: 'established',
        label: 'Established',
        description: 'Core security measures in place',
        color: 'indigo'
      };
    } else if (completionPercentage >= 30) {
      return {
        level: 'developing',
        label: 'Developing',
        description: 'Building essential security foundation',
        color: 'yellow'
      };
    } else {
      return {
        level: 'initial',
        label: 'Initial Setup',
        description: 'Getting started with family security',
        color: 'orange'
      };
    }
  }

  /**
   * Generate personalized recommendations
   */
  static async generateRecommendations(
    userId: string,
    areas: SecurityArea[],
    metrics: ProgressMetrics
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Priority 1: Urgent incomplete areas
    const urgentIncomplete = areas.filter(a => a.priority === 'urgent' && a.status !== 'complete');
    urgentIncomplete.forEach(area => {
      recommendations.push({
        id: `urgent-${area.id}`,
        type: 'action',
        title: `Complete ${area.name}`,
        description: area.description,
        priority: 'urgent',
        estimatedTime: area.estimatedTime || '15 minutes',
        actionUrl: area.actionUrl,
        icon: 'AlertCircle'
      });
    });

    // Priority 2: Areas needing review
    const needsReview = areas.filter(a => a.reviewNeeded);
    needsReview.forEach(area => {
      recommendations.push({
        id: `review-${area.id}`,
        type: 'review',
        title: `Review ${area.name}`,
        description: `Your ${area.name.toLowerCase()} haven't been updated in over a year`,
        priority: 'high',
        estimatedTime: '10 minutes',
        actionUrl: area.actionUrl,
        icon: 'Clock'
      });
    });

    // Priority 3: High priority incomplete areas
    const highIncomplete = areas.filter(a => a.priority === 'high' && a.status !== 'complete');
    highIncomplete.slice(0, 2).forEach(area => {
      recommendations.push({
        id: `high-${area.id}`,
        type: 'action',
        title: `Set up ${area.name}`,
        description: area.description,
        priority: 'high',
        estimatedTime: area.estimatedTime || '20 minutes',
        actionUrl: area.actionUrl,
        icon: 'FileText'
      });
    });

    // Priority 4: Annual review if needed
    if (metrics.nextReviewDate) {
      const daysUntilReview = Math.floor(
        (new Date(metrics.nextReviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilReview <= 30) {
        recommendations.push({
          id: 'annual-review',
          type: 'review',
          title: 'Annual Security Review',
          description: 'Review and update all your family security information',
          priority: 'medium',
          estimatedTime: '30 minutes',
          actionUrl: '/dashboard?review=true',
          dueDate: metrics.nextReviewDate,
          icon: 'Calendar'
        });
      }
    }

    // Add milestone recommendations
    const completionPercentage = metrics.totalAreas > 0 
      ? (metrics.completedAreas / metrics.totalAreas) * 100 
      : 0;
      
    if (completionPercentage >= 50 && completionPercentage < 60) {
      recommendations.push({
        id: 'milestone-halfway',
        type: 'milestone',
        title: 'You\'re halfway there!',
        description: 'You\'ve completed half of your family security setup. Keep up the great work!',
        priority: 'low',
        estimatedTime: '0 minutes',
        actionUrl: '/dashboard',
        icon: 'Trophy'
      });
    } else if (completionPercentage === 100) {
      recommendations.push({
        id: 'milestone-complete',
        type: 'milestone',
        title: 'Congratulations! All areas complete',
        description: 'Your family security plan is fully established. Remember to review it annually.',
        priority: 'low',
        estimatedTime: '0 minutes',
        actionUrl: '/dashboard',
        icon: 'Award'
      });
    }

    // Priority 5: Professional consultation for comprehensive plans
    if (metrics.completedAreas >= 6 && !recommendations.some(r => r.type === 'consultation')) {
      recommendations.push({
        id: 'legal-consultation',
        type: 'consultation',
        title: 'Consider Professional Review',
        description: 'Your security plan is comprehensive. Consider having it reviewed by a legal professional.',
        priority: 'low',
        estimatedTime: '1 hour',
        actionUrl: '/help?topic=legal-consultation',
        icon: 'Briefcase'
      });
    }

    // Limit to top 10 recommendations
    return recommendations.slice(0, 10);
  }

  /**
   * Get activity timeline
   */
  static async getActivityTimeline(userId: string, limit: number = 10): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // Fetch recent activities from various tables, tolerant to partial mocks
    let profiles: Array<{ updated_at?: string | null }> | undefined;
    let documents: DocumentRow[] | undefined;
    let assets: AssetRow[] | undefined;

    try {
      const res = await supabase
        .from('profiles')
        .select('updated_at')
        .eq('id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);
      profiles = (res as { data?: Array<{ updated_at?: string | null }> }).data;
    } catch (e) {
      console.warn('Failed to fetch profile updates for timeline', e);
    }

    try {
      const res = await supabase
        .from('documents')
        .select('id, category, created_at, updated_at, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      documents = (res as { data?: DocumentRow[] }).data;
    } catch (e) {
      console.warn('Failed to fetch documents for timeline', e);
    }

    try {
      const res = await supabase
        .from('assets')
        .select('id, type, name, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      assets = (res as { data?: AssetRow[] }).data;
    } catch (e) {
      console.warn('Failed to fetch assets for timeline', e);
    }

    // Add profile update events
    profiles?.forEach(profile => {
      if (profile.updated_at) {
        events.push({
          id: 'profile-update',
          date: profile.updated_at,
          type: 'profile_updated',
          area: 'Profile',
          description: 'Profile information updated'
        });
      }
    });
    // Convert to timeline events
    const latestAssetDate = Array.isArray(assets) && assets.length > 0
      ? assets.map(a => a.created_at).filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : null;

    documents?.forEach((doc) => {
      const created = doc.created_at;
      const updated = doc.updated_at;
      const isUpdated = updated && new Date(updated).getTime() > new Date(created).getTime();

      let type: TimelineEvent['type'];
      if (isUpdated) {
        type = 'updated';
      } else {
        // Pure creation: prefer 'document_added' unless there exists an asset created after this doc
        const assetAfterDoc = latestAssetDate && new Date(latestAssetDate).getTime() > new Date(created).getTime();
        type = assetAfterDoc ? 'completed' : 'document_added';
      }

      events.push({
        id: `doc-${doc.id}`,
        date: isUpdated ? updated : created,
        type,
        area: 'Documents',
        description: isUpdated ? `${doc.category} document updated` : `${doc.category} document added`
      });
    });

    assets?.forEach((asset) => {
      events.push({
        id: `asset-${asset.id}`,
        date: asset.created_at,
        type: 'asset_added',
        area: 'Assets',
        description: `${asset.name || asset.type} added`
      });
    });

    // Sort by date and return most recent
    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Mark an area as reviewed
   */
  static async markAreaReviewed(userId: string, areaId: string): Promise<void> {
    // Update the last reviewed date for the area
    // This would typically update a database record
    const reviewKey = `area_reviewed_${userId}_${areaId}`;
    localStorage.setItem(reviewKey, new Date().toISOString());
  }

  /**
   * Update area completion status
   */
  static async updateAreaStatus(
    userId: string,
    areaId: string,
    status: SecurityArea['status']
  ): Promise<void> {
    // Update the area status in the database
    // This is a placeholder for actual database update
    const statusKey = `area_status_${userId}_${areaId}`;
    localStorage.setItem(statusKey, status);
  }

  /**
   * Get completion percentage (non-gamified metric)
   */
  static getCompletionPercentage(metrics: ProgressMetrics): number {
    if (metrics.totalAreas === 0) return 0;
    return Math.round((metrics.completedAreas / metrics.totalAreas) * 100);
  }

  /**
   * Check if user needs immediate attention
   */
  static needsImmediateAttention(metrics: ProgressMetrics): boolean {
    return metrics.urgentActionsCount > 0 || metrics.needsReviewCount > 2;
  }

  /**
   * Get next priority action
   */
  static getNextPriorityAction(recommendations: Recommendation[]): Recommendation | null {
    // Find the highest priority recommendation
    const priorities = ['urgent', 'high', 'medium', 'low'];
    for (const priority of priorities) {
      const found = recommendations.find(r => r.priority === (priority as Recommendation['priority']));
      if (found) return found;
    }
    return null;
  }
}
