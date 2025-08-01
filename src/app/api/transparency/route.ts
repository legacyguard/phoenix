import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Define types for the response
interface DataFlow {
  collection: string;
  storage: string;
  processing: string;
  sharing: string;
}

interface AccessLogEntry {
  id: string;
  date: string;
  action: string;
  details: string;
  actor: string;
}

interface TransparencyData {
  dataFlow: DataFlow;
  accessLog: AccessLogEntry[];
  privacyMode: 'local' | 'cloud';
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract user token and verify
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Fetch user's privacy settings
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('privacy_mode')
      .eq('user_id', user.id)
      .single();

    const privacyMode = userProfile?.privacy_mode || 'local';

    // Fetch the 20 most recent access logs for this user
    const { data: accessLogs, error: logsError } = await supabaseAdmin
      .from('access_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (logsError) {
      console.error('Error fetching access logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch access logs' }, { status: 500 });
    }

    // Transform access logs to match the expected format
    const accessLog: AccessLogEntry[] = (accessLogs || []).map(log => {
      let details = '';
      let action = '';

      // Format action and details based on the log action type
      switch (log.action) {
        case 'LOGGED_IN':
          action = 'Login';
          details = `Logged in via ${log.metadata?.loginMethod || 'web'}`;
          break;
        case 'VIEWED_DOCUMENT':
          action = 'Document View';
          details = `Viewed document: ${log.metadata?.documentTitle || 'Unknown'}`;
          break;
        case 'ANALYZED_DOCUMENT':
          action = 'AI Analysis';
          details = `AI analyzed document: ${log.metadata?.fileName || 'Unknown'} (${log.metadata?.category || 'uncategorized'})`;
          break;
        case 'UPDATED_DOCUMENT':
          action = 'Document Update';
          details = `Updated document: ${log.metadata?.documentTitle || 'Unknown'}`;
          break;
        case 'UPDATED_TRUSTED_PERSON':
          action = 'Trusted Person Update';
          details = `Updated trusted person: ${log.metadata?.personName || 'Unknown'}`;
          break;
        default:
          action = log.action.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
          details = `${action} performed`;
      }

      return {
        id: log.id,
        date: new Date(log.created_at).toISOString(),
        action,
        details,
        actor: log.actor === 'AI_SYSTEM' ? 'AI System' : 
               log.actor === 'USER' ? 'You' : 
               log.actor
      };
    });

    // Define data flow based on privacy mode
    const dataFlow: DataFlow = privacyMode === 'local' ? {
      collection: "Documents are uploaded directly to your device",
      storage: "All files remain encrypted on your local storage",
      processing: "AI analysis happens entirely on your device",
      sharing: "Data never leaves your control unless you explicitly share"
    } : {
      collection: "Documents are uploaded to secure cloud servers",
      storage: "Files are encrypted and stored in EU data centers",
      processing: "AI analysis uses cloud services with end-to-end encryption",
      sharing: "Shared data is transmitted through secure, encrypted channels"
    };

    const transparencyData: TransparencyData = {
      dataFlow,
      accessLog,
      privacyMode
    };

    return NextResponse.json(transparencyData);

  } catch (error) {
    console.error('Transparency endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
