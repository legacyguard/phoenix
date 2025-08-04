import { NextApiRequest, NextApiResponse } from 'next';
import { WillTemplateService } from '@/features/will-generator/api/WillTemplateService';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify the user is authenticated
    const { user, error } = await supabase.auth.api.getUserByCookie(req);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the country code from the query and validate
    const { country, language } = req.query;
    if (typeof country !== 'string' || !country) {
      return res.status(400).json({ error: 'Invalid country code' });
    }

    // Fetch the relevant will template
    const template = await WillTemplateService.getTemplate(country, typeof language === 'string' ? language : undefined);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(200).json(template);
  } catch (err) {
    console.error('Error in /api/will/get-template:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};

