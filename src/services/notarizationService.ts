import { supabase } from '@/lib/supabase';

interface NotarizationRequest {
  willId: string;
  userId: string;
  countryCode: string;
  preferredDate?: string;
  preferredLocation?: string;
}

interface NotaryInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  availableDates: string[];
  fee: number;
  distance?: number;
}

export class NotarizationService {
  // Find notaries based on location
  async findNotaries(countryCode: string, location?: string): Promise<NotaryInfo[]> {
    try {
      // In production, this would integrate with notary directory APIs
      // For now, return mock data based on country
      const mockNotaries = this.getMockNotaries(countryCode);
      
      // Store search in database for tracking
      await supabase
        .from('notary_searches')
        .insert({
          country_code: countryCode,
          location,
          searched_at: new Date().toISOString()
        });

      return mockNotaries;
    } catch (error) {
      console.error('Error finding notaries:', error);
      return [];
    }
  }

  // Schedule notarization appointment
  async scheduleNotarization(request: NotarizationRequest): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('notarization_appointments')
        .insert({
          will_id: request.willId,
          user_id: request.userId,
          country_code: request.countryCode,
          preferred_date: request.preferredDate,
          preferred_location: request.preferredLocation,
          status: 'scheduled',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification email
      await this.sendNotarizationConfirmation(data.id);

      return data.id;
    } catch (error) {
      console.error('Error scheduling notarization:', error);
      throw error;
    }
  }

  // Complete notarization
  async completeNotarization(
    appointmentId: string,
    notaryDetails: {
      notaryName: string;
      notaryLicense: string;
      notarizationDate: string;
      location: string;
      witnesses?: string[];
    }
  ): Promise<boolean> {
    try {
      // Update appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('notarization_appointments')
        .update({
          status: 'completed',
          completed_at: notaryDetails.notarizationDate,
          notary_details: notaryDetails
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Update will status
      const { error: willError } = await supabase
        .from('generated_wills')
        .update({
          status: 'notarized',
          notarized_at: notaryDetails.notarizationDate,
          notary_info: {
            name: notaryDetails.notaryName,
            license: notaryDetails.notaryLicense,
            location: notaryDetails.location
          }
        })
        .eq('id', appointment.will_id);

      if (willError) throw willError;

      // Archive the notarized will
      await this.archiveNotarizedWill(appointment.will_id);

      return true;
    } catch (error) {
      console.error('Error completing notarization:', error);
      return false;
    }
  }

  // Archive completed will
  private async archiveNotarizedWill(willId: string): Promise<void> {
    try {
      // Get will data
      const { data: will, error: willError } = await supabase
        .from('generated_wills')
        .select('*')
        .eq('id', willId)
        .single();

      if (willError || !will) throw willError;

      // Create archive record
      await supabase
        .from('archived_wills')
        .insert({
          will_id: willId,
          user_id: will.user_id,
          country_code: will.country_code,
          will_content: will.will_content,
          pdf_content: will.pdf_content,
          signature_data: will.signature_data,
          notary_info: will.notary_info,
          archived_at: new Date().toISOString(),
          archive_type: 'notarized',
          metadata: {
            signed_at: will.signed_at,
            notarized_at: will.notarized_at,
            witnesses: will.witnesses
          }
        });

      // Create blockchain hash for immutability (optional)
      // await this.createBlockchainRecord(willId);

    } catch (error) {
      console.error('Error archiving will:', error);
    }
  }

  // Get notarization status
  async getNotarizationStatus(willId: string): Promise<{
    id: string;
    will_id: string;
    user_id: string;
    country_code: string;
    preferred_date?: string;
    preferred_location?: string;
    status: string;
    created_at: string;
    completed_at?: string;
    notary_details?: {
      notaryName: string;
      notaryLicense: string;
      notarizationDate: string;
      location: string;
      witnesses?: string[];
    };
  } | null> {
    try {
      const { data, error } = await supabase
        .from('notarization_appointments')
        .select('*')
        .eq('will_id', willId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error getting notarization status:', error);
      return null;
    }
  }

  // Mock notary data for different countries
  private getMockNotaries(countryCode: string): NotaryInfo[] {
    const notaryData: Record<string, NotaryInfo[]> = {
      SK: [
        {
          id: 'sk-notary-1',
          name: 'JUDr. Martin Novák',
          address: 'Hlavná 123, 811 01 Bratislava',
          phone: '+421 2 1234 5678',
          email: 'novak@notary.sk',
          availableDates: ['2024-02-01', '2024-02-02', '2024-02-05'],
          fee: 50
        }
      ],
      CZ: [
        {
          id: 'cz-notary-1',
          name: 'JUDr. Jana Svobodová',
          address: 'Václavské náměstí 10, 110 00 Praha 1',
          phone: '+420 222 333 444',
          email: 'svobodova@notar.cz',
          availableDates: ['2024-02-01', '2024-02-03', '2024-02-06'],
          fee: 1500
        }
      ],
      // Add more countries as needed
    };

    return notaryData[countryCode] || [];
  }

  private async sendNotarizationConfirmation(appointmentId: string): Promise<void> {
    // Email notification implementation
    console.log(`Sending notarization confirmation for appointment ${appointmentId}`);
  }
}

export const notarizationService = new NotarizationService();
