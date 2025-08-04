import { supabase } from '@/lib/supabase';

export interface ConsultationRequest {
  id: string;
  user_id: string;
  consultation_type: string;
  user_question: string;
  status: string;
  law_firm_response: string | null;
  country_code: string;
  payment_intent_id: string | null;
  payment_amount: number | null;
  payment_currency: string;
  paid_at: string | null;
  submitted_to_firm_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_firm?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LawFirm {
  id: string;
  name: string;
  country_code: string;
  email: string;
  consultation_types: string[];
  pricing: Record<string, number>;
}

export class LegalConsultationService {
  /**
   * Create a new legal consultation request
   */
  static async createConsultation(
    userId: string,
    consultationType: string,
    userQuestion: string,
    countryCode: string,
    paymentAmount: number
  ): Promise<ConsultationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('legal_consultations')
        .insert({
          user_id: userId,
          consultation_type: consultationType,
          user_question: userQuestion,
          country_code: countryCode,
          status: 'pending_payment',
          payment_amount: paymentAmount,
          payment_currency: 'EUR'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating consultation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createConsultation:', error);
      return null;
    }
  }

  /**
   * Update the consultation status
   */
  static async updateConsultationStatus(consultationId: string, status: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('legal_consultations')
        .update({ status })
        .eq('id', consultationId);

      if (error) {
        console.error('Error updating consultation status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateConsultationStatus:', error);
      return false;
    }
  }

  // Fetch consultations for a user
  static async getUserConsultations(userId: string): Promise<ConsultationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('legal_consultations')
        .select(`
          *,
          assigned_firm:law_firms(id, name, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user consultations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserConsultations:', error);
      return [];
    }
  }

  /**
   * Get consultation by ID
   */
  static async getConsultationById(consultationId: string): Promise<ConsultationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('legal_consultations')
        .select(`
          *,
          assigned_firm:law_firms(id, name, email)
        `)
        .eq('id', consultationId)
        .single();

      if (error) {
        console.error('Error fetching consultation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getConsultationById:', error);
      return null;
    }
  }

  /**
   * Update payment information after successful payment
   */
  static async updatePaymentInfo(
    consultationId: string,
    paymentIntentId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('legal_consultations')
        .update({
          payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
          status: 'submitted_to_firm'
        })
        .eq('id', consultationId);

      if (error) {
        console.error('Error updating payment info:', error);
        return false;
      }

      // Trigger notification to law firm
      await this.notifyLawFirm(consultationId);

      return true;
    } catch (error) {
      console.error('Error in updatePaymentInfo:', error);
      return false;
    }
  }

  /**
   * Get available law firms for a country
   */
  static async getAvailableLawFirms(countryCode: string): Promise<LawFirm[]> {
    try {
      const { data, error } = await supabase
        .from('law_firms')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching law firms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableLawFirms:', error);
      return [];
    }
  }

  /**
   * Notify law firm about new consultation
   */
  private static async notifyLawFirm(consultationId: string): Promise<void> {
    try {
      const consultation = await this.getConsultationById(consultationId);
      if (!consultation) return;

      // Find appropriate law firm based on country
      const lawFirms = await this.getAvailableLawFirms(consultation.country_code);
      const appropriateFirm = lawFirms.find(firm => 
        firm.consultation_types.includes(consultation.consultation_type)
      );

      if (!appropriateFirm) {
        console.error('No appropriate law firm found for consultation');
        return;
      }

      // Update consultation with assigned firm
      await supabase
        .from('legal_consultations')
        .update({ assigned_firm_id: appropriateFirm.id })
        .eq('id', consultationId);

      // In a real implementation, send email notification
      console.log(`Notifying ${appropriateFirm.name} about consultation ${consultationId}`);
      
      // TODO: Implement actual email notification using a service like SendGrid
      // await sendEmail({
      //   to: appropriateFirm.email,
      //   subject: 'New Legal Consultation Request',
      //   body: `New ${consultation.consultation_type} consultation from user ${consultation.user_id}`
      // });
    } catch (error) {
      console.error('Error notifying law firm:', error);
    }
  }

  /**
   * Get consultation statistics for a user
   */
  static async getUserConsultationStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('consultation_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching consultation stats:', error);
        return null;
      }

      return data || {
        total_consultations: 0,
        answered_consultations: 0,
        pending_payment: 0,
        awaiting_response: 0,
        avg_response_time_hours: null
      };
    } catch (error) {
      console.error('Error in getUserConsultationStats:', error);
      return null;
    }
  }
}

