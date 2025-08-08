import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';

interface ActivityDetails {
  [key: string]: unknown;
  action?: 'add' | 'remove' | 'update';
  relationship?: string;
  reason?: string;
  documentType?: string;
  assetType?: string;
  changeType?: string;
  value?: number;
  updateType?: string;
}

export interface UserActivity {
  type: 'profile_update' | 'asset_change' | 'beneficiary_update' | 'document_upload' | 'guardian_update';
  timestamp: Date;
  details: ActivityDetails;
  userId: string;
}

export interface ProfileChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: Date;
}

export interface ExternalIndicator {
  source: 'calendar' | 'email' | 'document_scan' | 'user_input';
  type: string;
  confidence: number;
  data: Record<string, unknown>;
}

export interface LifeEvent {
  id?: string;
  type: 'marriage' | 'birth' | 'death' | 'divorce' | 'job_change' | 'move' | 'retirement' | 'illness' | 'major_purchase';
  detectedDate: Date;
  confidence: number;
  suggestedUpdates: string[];
  urgency: 'immediate' | 'soon' | 'when_convenient';
  status: 'detected' | 'acknowledged' | 'dismissed' | 'completed';
  userId: string;
  indicators: string[];
}

export class LifeEventDetectionService {
  private static MIN_CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Main detection function that analyzes various signals to identify life events
   */
  static async detectLifeEvents(
    userId: string,
    userActivity: UserActivity[],
    profileChanges: ProfileChange[],
    externalIndicators: ExternalIndicator[]
  ): Promise<LifeEvent[]> {
    const detectedEvents: LifeEvent[] = [];

    // Check for marriage/divorce indicators
    const marriageEvent = this.detectMarriageOrDivorce(userActivity, profileChanges, externalIndicators);
    if (marriageEvent && marriageEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...marriageEvent, userId });
    }

    // Check for new child/birth
    const birthEvent = this.detectNewChild(userActivity, profileChanges, externalIndicators);
    if (birthEvent && birthEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...birthEvent, userId });
    }

    // Check for death in family
    const deathEvent = this.detectDeathInFamily(userActivity, profileChanges, externalIndicators);
    if (deathEvent && deathEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...deathEvent, userId });
    }

    // Check for job changes
    const jobEvent = this.detectJobChange(userActivity, profileChanges, externalIndicators);
    if (jobEvent && jobEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...jobEvent, userId });
    }

    // Check for relocation
    const moveEvent = this.detectRelocation(userActivity, profileChanges, externalIndicators);
    if (moveEvent && moveEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...moveEvent, userId });
    }

    // Check for retirement
    const retirementEvent = this.detectRetirement(userActivity, profileChanges, externalIndicators);
    if (retirementEvent && retirementEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...retirementEvent, userId });
    }

    // Check for major purchases
    const purchaseEvent = this.detectMajorPurchase(userActivity, profileChanges, externalIndicators);
    if (purchaseEvent && purchaseEvent.confidence >= this.MIN_CONFIDENCE_THRESHOLD) {
      detectedEvents.push({ ...purchaseEvent, userId });
    }

    return detectedEvents;
  }

  /**
   * Detect marriage or divorce based on various indicators
   */
  private static detectMarriageOrDivorce(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;
    let isMarriage = true;

    // Check profile changes for name changes
    const nameChange = profileChanges.find(change => 
      change.field === 'lastName' && 
      this.isRecent(change.timestamp, 90)
    );
    if (nameChange) {
      indicators.push('Name change detected');
      confidence += 0.3;
    }

    // Check beneficiary updates
    const beneficiaryUpdates = activities.filter(activity => 
      activity.type === 'beneficiary_update' && 
      this.isRecent(activity.timestamp, 60)
    );
    if (beneficiaryUpdates.length > 0) {
      indicators.push('Recent beneficiary updates');
      confidence += 0.4;
    }

    // Check for spouse additions/removals in trusted circle
    const spouseUpdate = activities.find(activity => 
      activity.type === 'guardian_update' && 
      activity.details.relationship === 'spouse' &&
      this.isRecent(activity.timestamp, 60)
    );
    if (spouseUpdate) {
      indicators.push('Spouse relationship updated');
      confidence += 0.5;
      isMarriage = spouseUpdate.details.action === 'add';
    }

    // Check external indicators
    const marriageIndicator = external.find(ind => 
      ind.type === 'marriage_certificate' || 
      ind.type === 'divorce_decree'
    );
    if (marriageIndicator) {
      indicators.push('Legal document detected');
      confidence = Math.min(1, confidence + 0.6);
      isMarriage = marriageIndicator.type === 'marriage_certificate';
    }

    if (confidence > 0) {
      return {
        type: isMarriage ? 'marriage' : 'divorce',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: isMarriage ? 
          [
            'Update beneficiaries across all assets',
            'Review and update your will',
            'Add spouse to trusted circle',
            'Update emergency contacts',
            'Consider joint asset ownership'
          ] : 
          [
            'Remove ex-spouse as beneficiary',
            'Update your will',
            'Remove from trusted circle',
            'Update asset ownership',
            'Review guardianship plans'
          ],
        urgency: 'immediate',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Detect new child or adoption
   */
  private static detectNewChild(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;

    // Check for child additions to family
    const childAddition = activities.find(activity => 
      activity.type === 'guardian_update' && 
      (activity.details.relationship === 'child' || activity.details.relationship === 'dependent') &&
      activity.details.action === 'add' &&
      this.isRecent(activity.timestamp, 90)
    );
    if (childAddition) {
      indicators.push('New child added to family');
      confidence += 0.6;
    }

    // Check for guardianship updates
    const guardianshipUpdate = activities.filter(activity => 
      activity.type === 'document_upload' && 
      activity.details.documentType === 'guardianship' &&
      this.isRecent(activity.timestamp, 60)
    );
    if (guardianshipUpdate.length > 0) {
      indicators.push('Guardianship documents updated');
      confidence += 0.4;
    }

    // Check external indicators
    const birthCertificate = external.find(ind => 
      ind.type === 'birth_certificate' || ind.type === 'adoption_papers'
    );
    if (birthCertificate) {
      indicators.push('Birth/adoption documentation detected');
      confidence = Math.min(1, confidence + 0.7);
    }

    if (confidence > 0) {
      return {
        type: 'birth',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: [
          'Add child as beneficiary',
          'Set up or update guardianship plans',
          'Review life insurance coverage',
          'Update your will with provisions for new child',
          'Consider education savings planning'
        ],
        urgency: 'immediate',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Detect death in the family
   */
  private static detectDeathInFamily(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;

    // Check for removal of family members
    const familyRemoval = activities.find(activity => 
      activity.type === 'guardian_update' && 
      activity.details.action === 'remove' &&
      activity.details.reason === 'deceased' &&
      this.isRecent(activity.timestamp, 30)
    );
    if (familyRemoval) {
      indicators.push('Family member marked as deceased');
      confidence += 0.8;
    }

    // Check for beneficiary removals
    const beneficiaryRemovals = activities.filter(activity => 
      activity.type === 'beneficiary_update' && 
      activity.details.action === 'remove' &&
      this.isRecent(activity.timestamp, 30)
    );
    if (beneficiaryRemovals.length > 0) {
      indicators.push('Beneficiary removed');
      confidence += 0.3;
    }

    // Check external indicators
    const deathCertificate = external.find(ind => 
      ind.type === 'death_certificate'
    );
    if (deathCertificate) {
      indicators.push('Death certificate detected');
      confidence = 1;
    }

    if (confidence > 0) {
      return {
        type: 'death',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: [
          'Update beneficiaries to remove deceased',
          'Review executor and guardian choices',
          'Update trusted circle',
          'Review asset distribution plans',
          'Consider grief counseling resources'
        ],
        urgency: 'immediate',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Detect job changes
   */
  private static detectJobChange(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;

    // Check profile changes for employment updates
    const employmentChange = profileChanges.find(change => 
      (change.field === 'employer' || change.field === 'jobTitle') &&
      this.isRecent(change.timestamp, 60)
    );
    if (employmentChange) {
      indicators.push('Employment information updated');
      confidence += 0.5;
    }

    // Check for income changes
    const incomeChange = profileChanges.find(change => 
      change.field === 'annualIncome' &&
      Math.abs((change.newValue - change.oldValue) / change.oldValue) > 0.2 &&
      this.isRecent(change.timestamp, 60)
    );
    if (incomeChange) {
      indicators.push('Significant income change');
      confidence += 0.4;
    }

    // Check for retirement account updates
    const retirementUpdate = activities.filter(activity => 
      activity.type === 'asset_change' && 
      activity.details.assetType === 'retirement_account' &&
      this.isRecent(activity.timestamp, 90)
    );
    if (retirementUpdate.length > 0) {
      indicators.push('Retirement account changes');
      confidence += 0.3;
    }

    if (confidence > 0) {
      return {
        type: 'job_change',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: [
          'Update employment information',
          'Review retirement account beneficiaries',
          'Update income information for planning',
          'Review insurance needs with new employer',
          'Consider impact on estate planning'
        ],
        urgency: 'soon',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Detect relocation
   */
  private static detectRelocation(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;

    // Check for address changes
    const addressChange = profileChanges.find(change => 
      (change.field === 'address' || change.field === 'city' || change.field === 'state') &&
      this.isRecent(change.timestamp, 60)
    );
    if (addressChange) {
      indicators.push('Address updated');
      confidence += 0.6;
    }

    // Check for local contact updates
    const contactUpdates = activities.filter(activity => 
      activity.type === 'guardian_update' && 
      activity.details.updateType === 'contact_info' &&
      this.isRecent(activity.timestamp, 60)
    );
    if (contactUpdates.length > 2) {
      indicators.push('Multiple contact updates');
      confidence += 0.3;
    }

    // Check for property changes
    const propertyChange = activities.find(activity => 
      activity.type === 'asset_change' && 
      activity.details.assetType === 'real_estate' &&
      this.isRecent(activity.timestamp, 90)
    );
    if (propertyChange) {
      indicators.push('Real estate changes');
      confidence += 0.5;
    }

    if (confidence > 0) {
      return {
        type: 'move',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: [
          'Update all addresses in documents',
          'Review local emergency contacts',
          'Update property records',
          'Consider state-specific legal requirements',
          'Update trusted professionals (lawyers, doctors)'
        ],
        urgency: 'soon',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Detect retirement
   */
  private static detectRetirement(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;

    // Check for employment status change
    const employmentStatus = profileChanges.find(change => 
      change.field === 'employmentStatus' &&
      change.newValue === 'retired' &&
      this.isRecent(change.timestamp, 90)
    );
    if (employmentStatus) {
      indicators.push('Employment status changed to retired');
      confidence += 0.8;
    }

    // Check for retirement account withdrawals
    const retirementActivity = activities.filter(activity => 
      activity.type === 'asset_change' && 
      activity.details.assetType === 'retirement_account' &&
      activity.details.changeType === 'withdrawal' &&
      this.isRecent(activity.timestamp, 180)
    );
    if (retirementActivity.length > 2) {
      indicators.push('Retirement account withdrawal activity');
      confidence += 0.4;
    }

    // Check age if available
    const ageCheck = profileChanges.find(change => 
      change.field === 'age' &&
      change.newValue >= 62
    );
    if (ageCheck) {
      indicators.push('Retirement age reached');
      confidence += 0.2;
    }

    if (confidence > 0) {
      return {
        type: 'retirement',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: [
          'Review retirement income strategy',
          'Update estate plan for retirement',
          'Review healthcare coverage',
          'Consider tax implications',
          'Update beneficiary designations'
        ],
        urgency: 'soon',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Detect major purchases
   */
  private static detectMajorPurchase(
    activities: UserActivity[],
    profileChanges: ProfileChange[],
    external: ExternalIndicator[]
  ): LifeEvent | null {
    const indicators: string[] = [];
    let confidence = 0;

    // Check for significant asset additions
    const majorAsset = activities.find(activity => 
      activity.type === 'asset_change' && 
      activity.details.action === 'add' &&
      (activity.details.value > 50000 || activity.details.assetType === 'real_estate') &&
      this.isRecent(activity.timestamp, 90)
    );
    if (majorAsset) {
      indicators.push('Major asset added');
      confidence += 0.7;
    }

    // Check for loan documents
    const loanDoc = activities.find(activity => 
      activity.type === 'document_upload' && 
      (activity.details.documentType === 'mortgage' || activity.details.documentType === 'loan') &&
      this.isRecent(activity.timestamp, 60)
    );
    if (loanDoc) {
      indicators.push('Loan documentation uploaded');
      confidence += 0.4;
    }

    if (confidence > 0) {
      return {
        type: 'major_purchase',
        detectedDate: new Date(),
        confidence,
        indicators,
        suggestedUpdates: [
          'Add new asset to inventory',
          'Update insurance coverage',
          'Review estate plan for new asset',
          'Update net worth calculations',
          'Consider asset protection strategies'
        ],
        urgency: 'when_convenient',
        status: 'detected',
        userId: ''
      };
    }

    return null;
  }

  /**
   * Helper function to check if a date is within recent days
   */
  private static isRecent(date: Date, daysThreshold: number): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  }

  /**
   * Save detected life event to database
   */
  static async saveLifeEvent(lifeEvent: LifeEvent): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'lifeEvents'), {
        ...lifeEvent,
        detectedDate: Timestamp.fromDate(lifeEvent.detectedDate),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving life event:', error);
      throw error;
    }
  }

  /**
   * Get active life events for a user
   */
  static async getActiveLifeEvents(userId: string): Promise<LifeEvent[]> {
    try {
      const q = query(
        collection(db, 'lifeEvents'),
        where('userId', '==', userId),
        where('status', 'in', ['detected', 'acknowledged']),
        orderBy('detectedDate', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        detectedDate: doc.data().detectedDate.toDate()
      } as LifeEvent));
    } catch (error) {
      console.error('Error fetching life events:', error);
      return [];
    }
  }

  /**
   * Update life event status
   */
  static async updateLifeEventStatus(
    eventId: string, 
    status: 'acknowledged' | 'dismissed' | 'completed'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'lifeEvents', eventId), {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating life event status:', error);
      throw error;
    }
  }

  /**
   * Get life event statistics for learning
   */
  static async getLifeEventStats(userId: string): Promise<{
    acknowledgedTypes: string[];
    dismissedTypes: string[];
    completionRate: number;
  }> {
    try {
      const q = query(
        collection(db, 'lifeEvents'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => doc.data() as LifeEvent);

      const acknowledged = events.filter(e => e.status === 'acknowledged').map(e => e.type);
      const dismissed = events.filter(e => e.status === 'dismissed').map(e => e.type);
      const completed = events.filter(e => e.status === 'completed').length;
      const total = events.filter(e => e.status !== 'dismissed').length;

      return {
        acknowledgedTypes: [...new Set(acknowledged)],
        dismissedTypes: [...new Set(dismissed)],
        completionRate: total > 0 ? completed / total : 0
      };
    } catch (error) {
      console.error('Error getting life event stats:', error);
      return {
        acknowledgedTypes: [],
        dismissedTypes: [],
        completionRate: 0
      };
    }
  }
}
