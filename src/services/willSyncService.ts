import { supabase } from '@/lib/supabase';
import type { 
  WillSyncPreferences, 
  WillSyncLog, 
  WillVersion, 
  WillSyncQueue,
  WillChanges 
} from '@/types/willSync';
import type { RealtimeChannel } from '@supabase/supabase-js';

class WillSyncService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  // Sync Preferences
  async getUserSyncPreferences(userId: string): Promise<WillSyncPreferences | null> {
    const { data, error } = await supabase
      .from('will_sync_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching sync preferences:', error);
      return null;
    }

    return data;
  }

  async updateSyncPreferences(preferences: WillSyncPreferences): Promise<boolean> {
    const { error } = await supabase
      .from('will_sync_preferences')
      .upsert({
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating sync preferences:', error);
      return false;
    }

    return true;
  }

  // Sync Logs
  async getSyncLogs(userId: string, status?: string): Promise<WillSyncLog[]> {
    let query = supabase
      .from('will_sync_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sync logs:', error);
      return [];
    }

    return data || [];
  }

  async approveSyncLog(logId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('will_sync_log')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId
      })
      .eq('id', logId);

    if (error) {
      console.error('Error approving sync log:', error);
      return false;
    }

    // Trigger will update
    await this.processApprovedSync(logId);
    return true;
  }

  async rejectSyncLog(logId: string): Promise<boolean> {
    const { error } = await supabase
      .from('will_sync_log')
      .update({
        status: 'rejected'
      })
      .eq('id', logId);

    if (error) {
      console.error('Error rejecting sync log:', error);
      return false;
    }

    return true;
  }

  // Version Management
  async getWillVersions(willId: string): Promise<WillVersion[]> {
    const { data, error } = await supabase
      .from('will_versions')
      .select('*')
      .eq('will_id', willId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching will versions:', error);
      return [];
    }

    return data || [];
  }

  async restoreWillVersion(versionId: string): Promise<boolean> {
    const { data: version, error: versionError } = await supabase
      .from('will_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !version) {
      console.error('Error fetching version:', versionError);
      return false;
    }

    // Create a new version from the restored one
    const { error } = await supabase.rpc('create_will_version', {
      p_will_id: version.will_id,
      p_content: version.content_snapshot,
      p_created_by: 'user',
      p_created_reason: `Restored from version ${version.version_number}`,
      p_changes: null
    });

    if (error) {
      console.error('Error restoring version:', error);
      return false;
    }

    return true;
  }

  // Real-time Subscriptions
  subscribeToSyncQueue(userId: string, callback: (payload: any) => void): () => void {
    const channelName = `sync-queue-${userId}`;
    
    // Unsubscribe from existing channel if any
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'will_sync_queue',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'will_sync_queue',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribeFromChannel(channelName);
  }

  subscribeToSyncLogs(userId: string, callback: (payload: any) => void): () => void {
    const channelName = `sync-logs-${userId}`;
    
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'will_sync_log',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return () => this.unsubscribeFromChannel(channelName);
  }

  private unsubscribeFromChannel(channelName: string) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(channelName);
    }
  }

  // Process approved sync
  private async processApprovedSync(logId: string) {
    const { data: log, error } = await supabase
      .from('will_sync_log')
      .select('*')
      .eq('id', logId)
      .single();

    if (error || !log) {
      console.error('Error fetching sync log:', error);
      return;
    }

    // Apply changes to will
    await this.applyChangesToWill(log.will_id, log.changes_made);
  }

  private async applyChangesToWill(willId: string, changes: WillChanges) {
    // Fetch current will content
    const { data: will, error: willError } = await supabase
      .from('generated_wills')
      .select('*')
      .eq('id', willId)
      .single();

    if (willError || !will) {
      console.error('Error fetching will:', willError);
      return;
    }

    // Apply changes to will content
    const updatedContent = this.mergeWillChanges(will.will_content, changes);

    // Create new version
    const { error } = await supabase.rpc('create_will_version', {
      p_will_id: willId,
      p_content: updatedContent,
      p_created_by: 'auto_sync',
      p_created_reason: 'Automatic sync from asset/beneficiary changes',
      p_changes: changes
    });

    if (error) {
      console.error('Error creating new will version:', error);
    }
  }

  private mergeWillChanges(currentContent: any, changes: WillChanges): any {
    const updatedContent = { ...currentContent };

    // Apply additions
    if (changes.added) {
      if (changes.added.assets) {
        // Add new assets to will content
        updatedContent.assets = [
          ...(updatedContent.assets || []),
          ...changes.added.assets
        ];
      }
      if (changes.added.beneficiaries) {
        updatedContent.beneficiaries = [
          ...(updatedContent.beneficiaries || []),
          ...changes.added.beneficiaries
        ];
      }
    }

    // Apply removals
    if (changes.removed) {
      if (changes.removed.assets) {
        const removedIds = changes.removed.assets.map(a => a.id);
        updatedContent.assets = updatedContent.assets?.filter(
          (a: any) => !removedIds.includes(a.id)
        );
      }
      if (changes.removed.beneficiaries) {
        const removedIds = changes.removed.beneficiaries.map(b => b.id);
        updatedContent.beneficiaries = updatedContent.beneficiaries?.filter(
          (b: any) => !removedIds.includes(b.id)
        );
        
        // Redistribute allocations
        if (changes.removed.beneficiaries.length > 0) {
          this.redistributeAllocations(updatedContent);
        }
      }
    }

    // Apply modifications
    if (changes.modified?.allocations) {
      changes.modified.allocations.forEach(alloc => {
        const beneficiary = updatedContent.beneficiaries?.find(
          (b: any) => b.id === alloc.beneficiary_id
        );
        if (beneficiary) {
          beneficiary.allocation = [{
            assetType: 'percentage',
            description: 'General Estate',
            value: alloc.new_percentage
          }];
        }
      });
    }

    return updatedContent;
  }

  private redistributeAllocations(content: any) {
    if (!content.beneficiaries || content.beneficiaries.length === 0) return;

    // Calculate equal distribution
    const equalShare = Math.floor(100 / content.beneficiaries.length);
    const remainder = 100 % content.beneficiaries.length;

    content.beneficiaries.forEach((beneficiary: any, index: number) => {
      const allocation = equalShare + (index < remainder ? 1 : 0);
      beneficiary.allocation = [{
        assetType: 'percentage',
        description: 'General Estate',
        value: allocation
      }];
    });
  }

  // Cleanup
  unsubscribeAll() {
    this.subscriptions.forEach((channel, name) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export const willSyncService = new WillSyncService();
