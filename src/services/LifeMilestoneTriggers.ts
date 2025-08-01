import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processLifeMilestones(userId: string) {
  const user = await supabase.from('users').select('id, dateOfBirth, googleOAuthToken, plaidAccessToken').eq('id', userId).single();
  if (!user.data) return;

  const userData = user.data;

  // Milestone 1: Birthday
  if (isBirthday(userData.dateOfBirth)) {
    await createNotification(userId, {
      type: 'milestone_birthday',
      message: "Happy Birthday! A new year is a great time for an annual review of your plan.",
      action: 'start_annual_review',
    });
  }

  // Milestone 2: Wedding
  const calendarEvents = await getCalendarEvents(userData.googleOAuthToken);
  if (detectWeddingOrAnniversary(calendarEvents)) {
    await createNotification(userId, {
      type: 'milestone_wedding',
      message: "Congratulations on your wedding! Remember to update your beneficiaries and will.",
      action: 'review_beneficiaries',
    });
  }

  // Milestone 3: Home Purchase
  const financialTransactions = await getFinancialData(userData.plaidAccessToken);
  if (detectHomePurchase(financialTransactions)) {
     await createNotification(userId, {
      type: 'milestone_home_purchase',
      message: "Congrats on your new home! Let's add the property to your possessions.",
      action: 'add_new_property',
    });
  }

  // Example Milestone 4: New Child
  // await createNotification(userId, {
  //   type: 'milestone_new_child',
  //   message: "It's a great time to name a guardian for your child and update your life insurance.",
  //   action: 'add_guardian_for_child',
  // });
}

async function createNotification(userId: string, { type, message, action }: { type: string; message: string; action: string }) {
  await supabase.from('notifications').insert([
    {
      user_id: userId,
      type,
      title: `Life Milestone: ${type.replace('_', ' ')}`,
      message,
      action,
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);
}

// Example utility function to check if today is the user's birthday
function isBirthday(dateOfBirth: string): boolean {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  return (
    today.getDate() === birthDate.getDate() &&
    today.getMonth() === birthDate.getMonth()
  );
}

async function getCalendarEvents(googleOAuthToken: string) {
  // Placeholder for Google Calendar API integration
  return [];
}

function detectWeddingOrAnniversary(events: Array<Record<string, unknown>>): boolean {
  // Placeholder for event detection logic
  return false;
}

async function getFinancialData(plaidAccessToken: string) {
  // Placeholder for Plaid API integration
  return [];
}

function detectHomePurchase(transactions: Array<Record<string, unknown>>): boolean {
  // Placeholder for home purchase detection
  return false;
}
