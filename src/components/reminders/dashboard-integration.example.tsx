// Example: How to integrate ReminderDashboard into the main Dashboard.tsx

import React from 'react';
import { ReminderDashboard } from '@/components/reminders';
import type { Reminder } from '@/components/reminders';

// Add this to your Dashboard component imports:
// import { ReminderDashboard } from '@/components/reminders';

// Sample reminder data (replace with actual data from your API/state)
const sampleReminders: Reminder[] = [
  {
    id: '1',
    title: 'Update Will',
    description: 'Review and update your will with recent changes',
    type: 'content_update',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: 'high',
    content_type: 'playbook',
    content_id: 'will-section'
  },
  {
    id: '2',
    title: 'Passport Expiring Soon',
    description: 'Your passport expires in 3 months',
    type: 'document_expiry',
    due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    priority: 'medium',
    content_type: 'document',
    content_id: 'passport-123'
  },
  {
    id: '3',
    title: 'Annual Legacy Review',
    description: 'Complete your annual legacy health check',
    type: 'review',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    priority: 'medium'
  }
];

// Calculate overdue reminders
const overdueCount = sampleReminders.filter(r => new Date(r.due_date) < new Date()).length;

// Add this to your Dashboard grid layout:
export function DashboardWithReminders() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Other dashboard widgets... */}
      
      {/* Add the ReminderDashboard widget */}
      <ReminderDashboard 
        reminders={sampleReminders}
        overdueCount={overdueCount}
        className="lg:col-span-1"
      />
      
      {/* Other dashboard widgets... */}
    </div>
  );
}

// Example of using reminder notifications on app load:
import { showReminderNotifications } from '@/components/reminders';

export function AppWithReminders() {
  React.useEffect(() => {
    // Check for due reminders on app load
    const dueReminders = sampleReminders.filter(r => {
      const dueDate = new Date(r.due_date);
      const now = new Date();
      return dueDate <= now;
    });

    if (dueReminders.length > 0) {
      // Show notifications for due reminders
      showReminderNotifications(dueReminders, {
        onComplete: (id) => {
          console.log('Completed reminder:', id);
          // Update your state/API
        },
        onSnooze: (id, duration) => {
          console.log('Snoozed reminder:', id, 'for', duration);
          // Update your state/API
        },
        onDismiss: (id) => {
          console.log('Dismissed reminder:', id);
          // Update your state/API
        }
      });
    }
  }, []);

  return <div>{/* Your app content */}</div>;
}
