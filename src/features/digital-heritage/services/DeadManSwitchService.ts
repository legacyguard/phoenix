import { supabase } from '@/lib/supabase';
import { DeadManSwitch, SwitchStatus, EscalationStep, CreateDeadManSwitchRequest, UpdateDeadManSwitchRequest } from '../types';

export class DeadManSwitchService {
  async create(request: CreateDeadManSwitchRequest): Promise<DeadManSwitch> {
    const { data, error } = await supabase
      .from('dead_man_switches')
      .insert({
        user_id: request.userId,
        name: request.name,
        description: request.description,
        check_interval: request.checkInterval,
        escalation_steps: request.escalationSteps,
        backup_contacts: request.backupContacts,
        status: SwitchStatus.ACTIVE,
        last_activity: new Date().toISOString(),
        next_check: new Date(Date.now() + request.checkInterval * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create dead man switch: ${error.message}`);
    }

    return this.mapToDeadManSwitch(data);
  }

  async getById(id: string): Promise<DeadManSwitch | null> {
    const { data, error } = await supabase
      .from('dead_man_switches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get dead man switch: ${error.message}`);
    }

    return data ? this.mapToDeadManSwitch(data) : null;
  }

  async getByUserId(userId: string): Promise<DeadManSwitch[]> {
    const { data, error } = await supabase
      .from('dead_man_switches')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get dead man switches: ${error.message}`);
    }

    return data.map(this.mapToDeadManSwitch);
  }

  async update(id: string, request: UpdateDeadManSwitchRequest): Promise<DeadManSwitch> {
    const updateData: Record<string, unknown> = {
      ...request,
      updated_at: new Date().toISOString()
    };

    if (request.checkInterval) {
      updateData.next_check = new Date(Date.now() + request.checkInterval * 24 * 60 * 60 * 1000).toISOString();
    }

    const { data, error } = await supabase
      .from('dead_man_switches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update dead man switch: ${error.message}`);
    }

    return this.mapToDeadManSwitch(data);
  }

  async checkIn(id: string): Promise<DeadManSwitch> {
    const { data: currentSwitch } = await supabase
      .from('dead_man_switches')
      .select('check_interval')
      .eq('id', id)
      .single();

    if (!currentSwitch) {
      throw new Error('Dead man switch not found');
    }

    const { data, error } = await supabase
      .from('dead_man_switches')
      .update({
        last_activity: new Date().toISOString(),
        next_check: new Date(Date.now() + currentSwitch.check_interval * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to check in: ${error.message}`);
    }

    return this.mapToDeadManSwitch(data);
  }

  async pause(id: string): Promise<DeadManSwitch> {
    const { data, error } = await supabase
      .from('dead_man_switches')
      .update({
        status: SwitchStatus.PAUSED,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to pause dead man switch: ${error.message}`);
    }

    return this.mapToDeadManSwitch(data);
  }

  async resume(id: string): Promise<DeadManSwitch> {
    const { data: currentSwitch } = await supabase
      .from('dead_man_switches')
      .select('check_interval')
      .eq('id', id)
      .single();

    if (!currentSwitch) {
      throw new Error('Dead man switch not found');
    }

    const { data, error } = await supabase
      .from('dead_man_switches')
      .update({
        status: SwitchStatus.ACTIVE,
        last_activity: new Date().toISOString(),
        next_check: new Date(Date.now() + currentSwitch.check_interval * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resume dead man switch: ${error.message}`);
    }

    return this.mapToDeadManSwitch(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('dead_man_switches')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete dead man switch: ${error.message}`);
    }
  }

  async getExpiredSwitches(): Promise<DeadManSwitch[]> {
    const { data, error } = await supabase
      .from('dead_man_switches')
      .select('*')
      .eq('status', SwitchStatus.ACTIVE)
      .lt('next_check', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to get expired switches: ${error.message}`);
    }

    return data.map(this.mapToDeadManSwitch);
  }

  async triggerSwitch(id: string): Promise<string[]> {
    const deadManSwitch = await this.getById(id);
    if (!deadManSwitch) {
      throw new Error('Dead man switch not found');
    }

    if (deadManSwitch.status !== SwitchStatus.ACTIVE) {
      throw new Error('Dead man switch is not active');
    }

    const transferIds: string[] = [];
    
    // Execute escalation steps
    for (const step of deadManSwitch.escalationSteps) {
      const transferId = await this.executeEscalationStep(deadManSwitch, step);
      if (transferId) {
        transferIds.push(transferId);
      }
    }

    // Update switch status
    await supabase
      .from('dead_man_switches')
      .update({
        status: SwitchStatus.TRIGGERED,
        triggered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return transferIds;
  }

  private async executeEscalationStep(
    deadManSwitch: DeadManSwitch,
    step: EscalationStep
  ): Promise<string | null> {
    // This would integrate with AssetTransferService
    // For now, return a mock transfer ID
    return `transfer_${deadManSwitch.id}_${step.id}`;
  }

  private mapToDeadManSwitch(data: Record<string, unknown>): DeadManSwitch {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      name: data.name as string,
      description: data.description as string,
      checkInterval: data.check_interval as number,
      escalationSteps: (data.escalation_steps || []) as EscalationStep[],
      backupContacts: (data.backup_contacts || []) as DeadManSwitch['backupContacts'],
      status: data.status as SwitchStatus,
      lastActivity: data.last_activity as string,
      nextCheck: data.next_check as string,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      triggeredAt: data.triggered_at as string | undefined,
      pausedAt: data.paused_at as string | undefined
    };
  }
}

export const deadManSwitchService = new DeadManSwitchService();