import { createClient } from '@/lib/supabase/server';
import { schedule } from 'node-cron';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface TimeCapsuleMessage {
  id: string;
  user_id: string;
  title: string;
  message_type: string;
  recipient_ids: string[];
  unlock_condition: 'date' | 'after_passing';
  unlock_date: string | null;
  status: 'locked' | 'unlocked' | 'delivered';
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  status: 'active' | 'deceased';
}

/**
 * Check and unlock time capsules based on their conditions
 */
async function checkAndUnlockTimeCapsules(): Promise<void> {
  const supabase = createClient();
  
  try {
    // Get current date at start of day for date comparisons
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all locked time capsules
    const { data: lockedCapsules, error: capsulesError } = await supabase
      .from('time_capsule_messages')
      .select('*')
      .eq('status', 'locked');

    if (capsulesError) {
      console.error('Error fetching locked capsules:', capsulesError);
      return;
    }

    if (!lockedCapsules || lockedCapsules.length === 0) {
      console.log('No locked time capsules to process');
      return;
    }

    // Process each locked capsule
    for (const capsule of lockedCapsules) {
      let shouldUnlock = false;

      // Check unlock conditions
      if (capsule.unlock_condition === 'date' && capsule.unlock_date) {
        const unlockDate = new Date(capsule.unlock_date);
        unlockDate.setHours(0, 0, 0, 0);
        
        if (unlockDate <= today) {
          shouldUnlock = true;
        }
      } else if (capsule.unlock_condition === 'after_passing') {
        // Check if user status is deceased
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', capsule.user_id)
          .single();

        if (userError) {
          console.error(`Error fetching user profile for ${capsule.user_id}:`, userError);
          continue;
        }

        if (userProfile?.status === 'deceased') {
          shouldUnlock = true;
        }
      }

      // Unlock the capsule if conditions are met
      if (shouldUnlock) {
        await unlockAndNotifyRecipients(capsule, supabase);
      }
    }

    console.log('Time capsule delivery check completed');
  } catch (error) {
    console.error('Error in time capsule delivery service:', error);
  }
}

/**
 * Unlock a time capsule and notify recipients
 */
async function unlockAndNotifyRecipients(
  capsule: TimeCapsuleMessage,
  supabase: Record<string, unknown>
): Promise<void> {
  try {
    // Update capsule status to unlocked
    const { error: updateError } = await supabase
      .from('time_capsule_messages')
      .update({ 
        status: 'unlocked',
        unlocked_at: new Date().toISOString()
      })
      .eq('id', capsule.id);

    if (updateError) {
      console.error(`Error unlocking capsule ${capsule.id}:`, updateError);
      return;
    }

    // Get sender information
    const { data: sender, error: senderError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', capsule.user_id)
      .single();

    if (senderError) {
      console.error(`Error fetching sender info:`, senderError);
      return;
    }

    // Notify each recipient
    for (const recipientId of capsule.recipient_ids) {
      // Get recipient information
      const { data: recipient, error: recipientError } = await supabase
        .from('trusted_people')
        .select('name, email')
        .eq('id', recipientId)
        .single();

      if (recipientError || !recipient) {
        console.error(`Error fetching recipient ${recipientId}:`, recipientError);
        continue;
      }

      // Send email notification
      await sendUnlockNotification(
        recipient.email,
        recipient.name,
        sender.full_name,
        capsule.title
      );

      // Create in-app notification
      await createInAppNotification(
        recipientId,
        capsule.id,
        sender.full_name,
        capsule.title,
        supabase
      );
    }

    // Update status to delivered
    await supabase
      .from('time_capsule_messages')
      .update({ status: 'delivered' })
      .eq('id', capsule.id);

    console.log(`Time capsule ${capsule.id} unlocked and notifications sent`);
  } catch (error) {
    console.error(`Error processing capsule ${capsule.id}:`, error);
  }
}

/**
 * Send email notification to recipient
 */
async function sendUnlockNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  capsuleTitle: string
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `${senderName} has left a message for you`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You have a new message from ${senderName}</h2>
          <p>Dear ${recipientName},</p>
          <p>${senderName} has left a time capsule message for you: "${capsuleTitle}"</p>
          <p>Log in to LegacyGuard to view this special message.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.APP_URL}/messages" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              View Message
            </a>
          </div>
          <p>Best regards,<br>The LegacyGuard Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}:`, error);
  }
}

/**
 * Create in-app notification for recipient
 */
async function createInAppNotification(
  recipientId: string,
  capsuleId: string,
  senderName: string,
  capsuleTitle: string,
  supabase: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        type: 'time_capsule_unlocked',
        title: `New message from ${senderName}`,
        message: `${senderName} has left you a time capsule message: "${capsuleTitle}"`,
        data: { capsule_id: capsuleId },
        read: false,
      });

    if (error) {
      console.error(`Error creating notification for ${recipientId}:`, error);
    }
  } catch (error) {
    console.error(`Error creating in-app notification:`, error);
  }
}

// Schedule the delivery service to run daily at 9:00 AM
schedule('0 9 * * *', checkAndUnlockTimeCapsules);

// Export for manual triggering if needed
export { checkAndUnlockTimeCapsules };
