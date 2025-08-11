import { supabase } from '@/lib/supabase';
import type { 
  SharedLink, 
  CreateShareLinkParams, 
  ShareExpiration,
  SharedLinkAccessLog,
  ContentType 
} from '@/types/sharing';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

export class SharingService {
  private static instance: SharingService;

  static getInstance(): SharingService {
    if (!SharingService.instance) {
      SharingService.instance = new SharingService();
    }
    return SharingService.instance;
  }

  // Generate share link
  async createShareLink(params: CreateShareLinkParams): Promise<SharedLink> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Calculate expiration date
    const expiresAt = this.calculateExpiration(params.expiration);

    // Hash password if provided
    let passwordHash = null;
    if (params.password) {
      passwordHash = await bcrypt.hash(params.password, 10);
    }

    // Generate unique token
    const { data: tokenData } = await supabase.rpc('generate_share_token');
    const token = tokenData || this.generateLocalToken();

    // Create share link
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        user_id: userData.user.id,
        content_type: params.content_type,
        content_id: params.content_id,
        token,
        title: params.title,
        description: params.description,
        expires_at: expiresAt,
        password_hash: passwordHash,
        max_views: params.max_views,
        settings: params.settings || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all share links for current user
  async getUserShareLinks(): Promise<SharedLink[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get share link by token (public access)
  async getShareLinkByToken(token: string): Promise<SharedLink | null> {
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('token', token)
      .is('revoked_at', null)
      .single();

    if (error) return null;

    // Check if link is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Check if max views reached
    if (data.max_views && data.view_count >= data.max_views) {
      return null;
    }

    return data;
  }

  // Validate password for protected link
  async validateSharePassword(token: string, password: string): Promise<boolean> {
    const link = await this.getShareLinkByToken(token);
    if (!link || !link.password_hash) return false;

    return bcrypt.compare(password, link.password_hash);
  }

  // Log access to shared link
  async logShareAccess(
    token: string,
    metadata?: {
      ip_address?: string;
      user_agent?: string;
      referer?: string;
    }
  ): Promise<void> {
    await supabase.rpc('log_share_access', {
      p_token: token,
      p_ip_address: metadata?.ip_address,
      p_user_agent: metadata?.user_agent,
      p_referer: metadata?.referer,
    });
  }

  // Get access logs for a share link
  async getShareAccessLogs(shareId: string): Promise<SharedLinkAccessLog[]> {
    const { data, error } = await supabase
      .from('shared_link_access_logs')
      .select('*')
      .eq('shared_link_id', shareId)
      .order('accessed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Revoke share link
  async revokeShareLink(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', shareId);

    if (error) throw error;
  }

  // Update share link settings
  async updateShareLink(
    shareId: string, 
    updates: Partial<SharedLink>
  ): Promise<SharedLink> {
    const { data, error } = await supabase
      .from('shared_links')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', shareId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Generate QR code for share link
  async generateQRCode(shareUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(shareUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  // Get shared content based on type and ID
  async getSharedContent(contentType: ContentType, contentId: string): Promise<Record<string, unknown>> {
    switch (contentType) {
      case 'playbook_section':
        return this.getPlaybookSection(contentId);
      case 'asset_summary':
        return this.getAssetSummary(contentId);
      case 'inheritance_allocation':
        return this.getInheritanceAllocation(contentId);
      case 'document':
        return this.getDocument(contentId);
      default:
        throw new Error('Invalid content type');
    }
  }

  // Private helper methods
  private calculateExpiration(expiration: ShareExpiration): string | null {
    if (expiration === 'never') return null;

    const now = new Date();
    switch (expiration) {
      case '24h':
        now.setHours(now.getHours() + 24);
        break;
      case '7d':
        now.setDate(now.getDate() + 7);
        break;
      case '30d':
        now.setDate(now.getDate() + 30);
        break;
    }
    return now.toISOString();
  }

  private generateLocalToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private async getPlaybookSection(sectionId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('playbooks')
      .select(`
        *,
        playbook_contacts (
          *,
          contact:contacts (*)
        ),
        playbook_documents (
          *,
          document:documents (
            id,
            title,
            file_type
          )
        )
      `)
      .eq('id', sectionId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getAssetSummary(userId: string): Promise<Record<string, unknown>> {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Calculate summary data
    const summary = {
      totalAssets: assets?.length || 0,
      categories: this.calculateCategoryDistribution(assets || []),
      lastUpdated: new Date().toISOString()
    };

    return summary;
  }

  private async getInheritanceAllocation(userId: string): Promise<Record<string, unknown>> {
    const { data: allocations, error } = await supabase
      .from('asset_beneficiaries')
      .select(`
        *,
        asset:assets (*),
        beneficiary:beneficiaries (*)
      `)
      .eq('assets.user_id', userId);

    if (error) throw error;

    // Calculate allocation summary
    const summary = this.calculateAllocationSummary(allocations || []);
    return summary;
  }

  private async getDocument(documentId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return data;
  }

  private calculateCategoryDistribution(assets: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    const categories: Record<string, number> = {};
    
    assets.forEach(asset => {
      const category = asset.category || 'uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });

    const total = assets.length;
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }

  private calculateAllocationSummary(allocations: Array<Record<string, unknown>>): Record<string, unknown> {
    const beneficiaryMap: Record<string, Record<string, unknown>> = {};
    let totalAllocated = 0;

    allocations.forEach(allocation => {
      const beneficiaryId = allocation.beneficiary.id;
      if (!beneficiaryMap[beneficiaryId]) {
        beneficiaryMap[beneficiaryId] = {
          name: allocation.beneficiary.name,
          relationship: allocation.beneficiary.relationship,
          allocation: 0
        };
      }
      beneficiaryMap[beneficiaryId].allocation += allocation.percentage || 0;
      totalAllocated += allocation.percentage || 0;
    });

    return {
      beneficiaries: Object.values(beneficiaryMap),
      totalAllocated,
      unallocated: 100 - totalAllocated
    };
  }
}

export const sharingService = SharingService.getInstance();
