import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { logActivity } from '@/services/loggingService';

export const useAuthLogging = () => {
  const { user, isSignedIn } = useUser();
  const hasLoggedCurrentSession = useRef(false);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    // Log user login when authentication state changes
    if (isSignedIn && user && user.id !== previousUserId.current && !hasLoggedCurrentSession.current) {
      // New login detected
      hasLoggedCurrentSession.current = true;
      previousUserId.current = user.id;

      // Log the login activity
      logActivity(
        user.id,
        'USER',
        'LOGGED_IN',
        undefined,
        'unknown', // IP address would need to be fetched from API
        navigator.userAgent,
        {
          email: user.primaryEmailAddress?.emailAddress,
          loginMethod: 'clerk',
          timestamp: new Date().toISOString()
        }
      ).catch(error => {
        console.error('Failed to log login activity:', error);
      });
    } else if (!isSignedIn && previousUserId.current) {
      // User logged out
      hasLoggedCurrentSession.current = false;
      previousUserId.current = null;
    }
  }, [isSignedIn, user]);

  return { user, isSignedIn };
};
