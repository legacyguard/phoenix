import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function requirePremium(userId: string): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  return !error && profile?.subscription_status === 'premium';
}

export function premiumRequiredResponse() {
  return NextResponse.json(
    { 
      error: 'Access denied: This is a premium feature.',
      requiresPremium: true,
      upgradeUrl: '/pricing'
    },
    { status: 403 }
  );
}
