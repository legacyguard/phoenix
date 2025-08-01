export class ProgressService {
  static getProgressStatus(userId) {
    // Example data fetching logic
    // Here you would fetch user profile data from your database to determine the status

    // Mock user profile analysis
    const completionScore = this.calculateCompletionScore(userId);
    const lastReviewDate = this.getLastReviewDate(userId);
    const isReviewNeeded = this.checkIfReviewNeeded(lastReviewDate);
    const { currentStage, nextObjective } = this.determineStageAndObjective(completionScore, lastReviewDate, isReviewNeeded);

    return {
      completionScore,
      currentStage,
      nextObjective,
      lastReviewDate,
      isReviewNeeded
    };
  }

  static calculateCompletionScore(userId) {
    // Mock calculation logic
    // Replace with real calculations based on user profile
    return 70; // Assume this user is at 70% completion
  }

  static getLastReviewDate(userId) {
    // Mock: In a real app, fetch from database
    // Return null if never reviewed, or a date string
    const mockLastReview = localStorage.getItem(`lastReview_${userId}`);
    return mockLastReview || null;
  }

  static checkIfReviewNeeded(lastReviewDate) {
    if (!lastReviewDate) return true; // Never reviewed
    
    const lastReview = new Date(lastReviewDate);
    const now = new Date();
    const daysSinceReview = Math.floor((now - lastReview) / (1000 * 60 * 60 * 24));
    
    // Review needed if more than 365 days have passed
    return daysSinceReview > 365;
  }

  static updateLastReviewDate(userId) {
    const now = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // In a real app, save to database
    localStorage.setItem(`lastReview_${userId}`, now);
    return now;
  }

  static determineStageAndObjective(strength, lastReviewDate, isReviewNeeded) {
    if (strength < 25) {
      return {
        currentStage: 'Foundation',
        nextObjective: {
          type: 'task',
          title: 'Add Your First Trusted Person',
          description: 'Start by adding an executor to manage your affairs.',
          estimatedTime: '5 minutes',
          actionUrl: '/trusted-circle',
          actionLabel: 'Add Executor'
        }
      };
    } else if (strength < 60) {
      return {
        currentStage: 'Buildout',
        nextObjective: {
          type: 'task',
          title: 'Add your primary bank account',
          description: 'Ensure your financial assets are accounted for.',
          estimatedTime: '10 minutes',
          actionUrl: '/vault',
          actionLabel: 'Add Bank Account'
        }
      };
    } else if (strength < 75) {
      return {
        currentStage: 'Reinforcement',
        nextObjective: {
          type: 'task',
          title: 'Set up Family Hub',
          description: 'Define access levels and ensure your family is well-prepared.',
          estimatedTime: '8 minutes',
          actionUrl: '/family-hub',
          actionLabel: 'Set Up Hub'
        }
      };
    } else if (strength >= 75 && strength < 90) {
      return {
        currentStage: 'Advanced Planning',
        nextObjective: {
          type: 'deepDive',
          title: 'Foundation Secured. Plan Your Legacy.',
          description: 'Your essential plan is solid. You\'ve done an incredible job protecting your family\'s future. Now, it\'s time to use Heritage Vault\'s advanced features to shape your legacy and finalize your succession plan.',
          features: [
            {
              id: 'legacy_briefing',
              title: 'Legacy Letters',
              description: 'Leave sealed video, audio, and text messages for your loved ones.',
              actionUrl: '/legacy-letters',
              icon: 'Mail'
            },
            {
              id: 'succession_protocol',
              title: 'Succession Planning',
              description: 'Equip your executor with a step-by-step guide to ensure a smooth transition.',
              actionUrl: '/dashboard',
              icon: 'ClipboardCheck'
            }
          ]
        }
      };
    } else if (strength === 100) {
      return {
        currentStage: 'Monitoring',
        nextObjective: {
          type: 'monitoring',
          title: 'Well Done. Your Heritage is Secure.',
          description: 'You have done everything necessary to protect your family and secure your legacy. Heritage Vault is now actively monitoring your plan.',
          lastReviewDate: lastReviewDate || 'Never',
          isReviewNeeded,
          notifications: [
            {
              id: '1',
              text: 'Your Passport is set to expire in 90 days.',
              type: 'warning',
              actionUrl: '/documents/passport-id'
            },
            {
              id: '2',
              text: 'Review your will documents.',
              type: 'info',
              actionUrl: '/documents/will'
            },
            {
              id: '3',
              text: 'Your family trust needs updating.',
              type: 'info',
              actionUrl: '/documents/family-trust'
            }
          ]
        }
      };
    } else {
      return {
        currentStage: 'Legacy',
        nextObjective: {
          type: 'task',
          title: 'Complete Your Legacy Plan',
          description: 'Add final touches to your comprehensive legacy plan.',
          estimatedTime: '15 minutes',
          actionUrl: '/briefing',
          actionLabel: 'Complete Legacy'
        }
      };
    }
  }
}

