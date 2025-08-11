import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ExecutorTask = Database['public']['Tables']['executor_tasks']['Insert'];

interface TaskTemplate {
  title: string;
  category: 'immediate' | 'first_week' | 'ongoing';
  priority: number;
  daysFromNow?: number;
  detailsTemplate: string;
  requiresDocuments?: string[]; // Document types needed for personalization
}

// Master list of standard executor tasks
const EXECUTOR_TASK_TEMPLATES: TaskTemplate[] = [
  // Immediate tasks (First 48 hours)
  {
    title: 'Obtain 5-10 certified copies of the death certificate',
    category: 'immediate',
    priority: 1,
    detailsTemplate: 'You will need these for banks, government agencies, and insurance companies. The funeral home can usually help you with this. Keep multiple copies as many institutions require originals.',
  },
  {
    title: 'Notify Social Security Administration',
    category: 'immediate',
    priority: 2,
    detailsTemplate: 'Call 1-800-772-1213 or visit https://www.ssa.gov to report the death. You\'ll need the deceased\'s Social Security number and date of birth.',
  },
  {
    title: 'Contact the life insurance provider',
    category: 'immediate',
    priority: 3,
    detailsTemplate: 'The policy is with {{insuranceProvider}}. Policy number: {{policyNumber}}. Contact: {{agentName}} at {{agentPhone}}.',
    requiresDocuments: ['life_insurance'],
  },
  {
    title: 'Secure the home and valuables',
    category: 'immediate',
    priority: 4,
    detailsTemplate: 'Change locks if necessary. Ensure valuable items are secure. The primary residence is at {{primaryAddress}}.',
  },
  {
    title: 'Notify employer or business partners',
    category: 'immediate',
    priority: 5,
    detailsTemplate: 'Contact {{employerName}} HR department at {{employerPhone}}. Request information about final paycheck, benefits, and life insurance.',
  },

  // First week tasks
  {
    title: 'Contact banks and financial institutions',
    category: 'first_week',
    priority: 6,
    daysFromNow: 3,
    detailsTemplate: 'Accounts to notify: {{bankAccounts}}. Bring death certificate and executor documentation.',
    requiresDocuments: ['bank_statements'],
  },
  {
    title: 'File for probate if necessary',
    category: 'first_week',
    priority: 7,
    daysFromNow: 5,
    detailsTemplate: 'Contact the probate court in {{county}} County. The will is located in {{willLocation}}.',
    requiresDocuments: ['will'],
  },
  {
    title: 'Contact credit card companies',
    category: 'first_week',
    priority: 8,
    daysFromNow: 4,
    detailsTemplate: 'Cancel or transfer the following cards: {{creditCards}}. This prevents fraudulent charges.',
  },
  {
    title: 'Notify utilities and cancel subscriptions',
    category: 'first_week',
    priority: 9,
    daysFromNow: 7,
    detailsTemplate: 'Transfer or cancel: {{utilityProviders}}. Digital subscriptions: {{digitalSubscriptions}}.',
  },

  // Ongoing tasks
  {
    title: 'File final tax returns',
    category: 'ongoing',
    priority: 10,
    daysFromNow: 30,
    detailsTemplate: 'File final income tax return by April 15th. Tax preparer: {{taxPreparer}}. Previous returns located: {{taxDocLocation}}.',
    requiresDocuments: ['tax_returns'],
  },
  {
    title: 'Distribute assets according to will',
    category: 'ongoing',
    priority: 11,
    daysFromNow: 60,
    detailsTemplate: 'Review will and trust documents. Primary beneficiaries: {{beneficiaries}}. Work with estate attorney if needed.',
    requiresDocuments: ['will', 'trust'],
  },
  {
    title: 'Close or transfer digital accounts',
    category: 'ongoing',
    priority: 12,
    daysFromNow: 14,
    detailsTemplate: 'Important accounts: {{digitalAccounts}}. Use legacy contact features where available.',
  },
];

export class ExecutorTaskService {
  /**
   * Generates personalized executor tasks when a user's account is marked as deceased
   */
  static async generateExecutorTasks(
    deceasedUserId: string,
    executorId: string
  ): Promise<void> {
    try {
      // Fetch deceased user's data and documents
      const userData = await this.fetchUserData(deceasedUserId);
      const documents = await this.fetchUserDocuments(deceasedUserId);

      // Generate tasks from templates
      const tasks: ExecutorTask[] = [];

      for (const template of EXECUTOR_TASK_TEMPLATES) {
        const personalizedDetails = await this.personalizeTaskDetails(
          template,
          userData,
          documents
        );

        const task: ExecutorTask = {
          deceased_user_id: deceasedUserId,
          executor_id: executorId,
          title: template.title,
          details: personalizedDetails,
          category: template.category,
          priority: template.priority,
          status: 'pending',
          due_date: template.daysFromNow
            ? new Date(Date.now() + template.daysFromNow * 24 * 60 * 60 * 1000).toISOString()
            : null,
          related_document_ids: this.getRelatedDocumentIds(template, documents),
          metadata: {
            generated_at: new Date().toISOString(),
            template_version: '1.0',
          },
        };

        tasks.push(task);
      }

      // Batch insert all tasks
      const { error } = await supabase
        .from('executor_tasks')
        .insert(tasks);

      if (error) {
        console.error('Error inserting executor tasks:', error);
        throw error;
      }

      console.log(`Generated ${tasks.length} executor tasks for user ${deceasedUserId}`);
    } catch (error) {
      console.error('Error generating executor tasks:', error);
      throw error;
    }
  }

  /**
   * Fetches user data for personalization
   */
  private static async fetchUserData(userId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return {};
    }

    return data || {};
  }

  /**
   * Fetches user documents for task personalization
   */
  private static async fetchUserDocuments(userId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user documents:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Personalizes task details by replacing template variables with actual data
   */
  private static async personalizeTaskDetails(
    template: TaskTemplate,
    userData: Record<string, unknown>,
    documents: Array<Record<string, unknown>>
  ): Promise<string> {
    let details = template.detailsTemplate;

    // Replace template variables based on document type
    if (template.requiresDocuments?.includes('life_insurance')) {
      const insuranceDoc = documents.find(d => d.category === 'insurance' && d.metadata?.type === 'life');
      if (insuranceDoc?.extracted_data) {
        details = details
          .replace('{{insuranceProvider}}', insuranceDoc.extracted_data.provider || '[Insurance Provider]')
          .replace('{{policyNumber}}', insuranceDoc.extracted_data.policy_number || '[Policy Number]')
          .replace('{{agentName}}', insuranceDoc.extracted_data.agent_name || '[Agent Name]')
          .replace('{{agentPhone}}', insuranceDoc.extracted_data.agent_phone || '[Agent Phone]');
      }
    }

    // Replace user profile data
    details = details
      .replace('{{primaryAddress}}', userData.primary_address || '[Primary Address]')
      .replace('{{employerName}}', userData.employer_name || '[Employer]')
      .replace('{{employerPhone}}', userData.employer_phone || '[Employer Phone]')
      .replace('{{county}}', userData.county || '[County]')
      .replace('{{taxPreparer}}', userData.tax_preparer || '[Tax Preparer]');

    // Replace aggregated data
    if (details.includes('{{bankAccounts}}')) {
      const bankDocs = documents.filter(d => d.category === 'financial' && d.metadata?.type === 'bank_statement');
      const banks = [...new Set(bankDocs.map(d => d.extracted_data?.bank_name).filter(Boolean))];
      details = details.replace('{{bankAccounts}}', banks.join(', ') || '[Bank Accounts]');
    }

    if (details.includes('{{beneficiaries}}')) {
      const willDoc = documents.find(d => d.category === 'legal' && d.metadata?.type === 'will');
      const beneficiaries = willDoc?.extracted_data?.beneficiaries?.join(', ') || '[Beneficiaries]';
      details = details.replace('{{beneficiaries}}', beneficiaries);
    }

    // Clean up any remaining template variables
    details = details.replace(/\{\{[^}]+\}\}/g, '[Information to be provided]');

    return details;
  }

  /**
   * Gets related document IDs for a task
   */
  private static getRelatedDocumentIds(
    template: TaskTemplate,
    documents: Array<Record<string, unknown>>
  ): string[] {
    if (!template.requiresDocuments) return [];

    const relatedDocs: string[] = [];

    for (const docType of template.requiresDocuments) {
      const matchingDocs = documents.filter(d => {
        switch (docType) {
          case 'life_insurance':
            return d.category === 'insurance' && d.metadata?.type === 'life';
          case 'will':
            return d.category === 'legal' && d.metadata?.type === 'will';
          case 'bank_statements':
            return d.category === 'financial' && d.metadata?.type === 'bank_statement';
          case 'tax_returns':
            return d.category === 'financial' && d.metadata?.type === 'tax_return';
          default:
            return false;
        }
      });

      relatedDocs.push(...matchingDocs.map(d => d.id));
    }

    return relatedDocs;
  }

  /**
   * Fetches executor tasks for a given executor
   */
  static async getExecutorTasks(executorId: string) {
    const { data, error } = await supabase
      .from('executor_tasks')
      .select('*')
      .eq('executor_id', executorId)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching executor tasks:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Updates a task's status
   */
  static async updateTaskStatus(
    taskId: string,
    status: 'pending' | 'completed',
    executorId: string
  ) {
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('executor_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('executor_id', executorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }

    return data;
  }
}
