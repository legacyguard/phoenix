import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  UserActivity, 
  ProfileChange, 
  ExternalIndicator,
  LifeEvent,
  LifeEventDetectionService 
} from '@/services/lifeEventDetection';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

interface UseLifeEventTrackingReturn {
  detectedEvents: LifeEvent[];
  isTracking: boolean;
  trackActivity: (activity: Omit<UserActivity, 'userId' | 'timestamp'>) => Promise<void>;
  trackProfileChange: (change: Omit<ProfileChange, 'timestamp'>) => Promise<void>;
  trackExternalIndicator: (indicator: ExternalIndicator) => Promise<void>;
  checkForLifeEvents: () => Promise<void>;
}

export const useLifeEventTracking = (): UseLifeEventTrackingReturn => {
  const { userId } = useAuth();
  const [detectedEvents, setDetectedEvents] = useState<LifeEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [activityBuffer, setActivityBuffer] = useState<UserActivity[]>([]);
  const [profileChanges, setProfileChanges] = useState<ProfileChange[]>([]);
  const [externalIndicators, setExternalIndicators] = useState<ExternalIndicator[]>([]);

  // Track user activity
  const trackActivity = useCallback(async (
    activity: Omit<UserActivity, 'userId' | 'timestamp'>
  ): Promise<void> => {
    if (!userId) return;

    const fullActivity: UserActivity = {
      ...activity,
      userId,
      timestamp: new Date()
    };

    // Add to local buffer
    setActivityBuffer(prev => [...prev, fullActivity]);

    // Save to database
    try {
      await addDoc(collection(db, 'userActivities'), {
        ...fullActivity,
        timestamp: Timestamp.fromDate(fullActivity.timestamp)
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [userId]);

  // Track profile changes
  const trackProfileChange = useCallback(async (
    change: Omit<ProfileChange, 'timestamp'>
  ): Promise<void> => {
    if (!userId) return;

    const fullChange: ProfileChange = {
      ...change,
      timestamp: new Date()
    };

    // Add to local buffer
    setProfileChanges(prev => [...prev, fullChange]);

    // Save to database
    try {
      await addDoc(collection(db, 'profileChanges'), {
        ...fullChange,
        userId,
        timestamp: Timestamp.fromDate(fullChange.timestamp)
      });
    } catch (error) {
      console.error('Error tracking profile change:', error);
    }

    // Trigger immediate life event check for significant changes
    if (shouldTriggerImmediateCheck(change.field)) {
      setTimeout(() => checkForLifeEvents(), 1000);
    }
  }, [userId, checkForLifeEvents]);

  // Track external indicators (e.g., from document uploads, AI analysis)
  const trackExternalIndicator = useCallback(async (
    indicator: ExternalIndicator
  ): Promise<void> => {
    if (!userId) return;

    // Add to local buffer
    setExternalIndicators(prev => [...prev, indicator]);

    // Save to database
    try {
      await addDoc(collection(db, 'externalIndicators'), {
        ...indicator,
        userId,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error tracking external indicator:', error);
    }

    // High confidence indicators trigger immediate check
    if (indicator.confidence > 0.8) {
      setTimeout(() => checkForLifeEvents(), 1000);
    }
  }, [userId, checkForLifeEvents]);

  // Check for life events based on accumulated data
  const checkForLifeEvents = useCallback(async (): Promise<void> => {
    if (!userId || isTracking) return;

    setIsTracking(true);
    try {
      // Get recent data from database if buffers are empty
      let activities = activityBuffer;
      let changes = profileChanges;
      let indicators = externalIndicators;

      if (activities.length === 0) {
        activities = await getRecentActivities(userId);
      }
      if (changes.length === 0) {
        changes = await getRecentProfileChanges(userId);
      }
      if (indicators.length === 0) {
        indicators = await getRecentIndicators(userId);
      }

      // Run detection
      const events = await LifeEventDetectionService.detectLifeEvents(
        userId,
        activities,
        changes,
        indicators
      );

      // Save detected events
      const savedEvents = await Promise.all(
        events.map(async (event) => {
          const id = await LifeEventDetectionService.saveLifeEvent(event);
          return { ...event, id };
        })
      );

      setDetectedEvents(savedEvents);

      // Clear buffers after processing
      setActivityBuffer([]);
      setProfileChanges([]);
      setExternalIndicators([]);
    } catch (error) {
      console.error('Error checking for life events:', error);
    } finally {
      setIsTracking(false);
    }
  }, [userId, activityBuffer, profileChanges, externalIndicators, isTracking]);

  // Load recent activities from database
  const getRecentActivities = async (userId: string): Promise<UserActivity[]> => {
    try {
      const q = query(
        collection(db, 'userActivities'),
        where('userId', '==', userId),
        where('timestamp', '>', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)), // Last 90 days
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as UserActivity));
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  };

  // Load recent profile changes from database
  const getRecentProfileChanges = async (userId: string): Promise<ProfileChange[]> => {
    try {
      const q = query(
        collection(db, 'profileChanges'),
        where('userId', '==', userId),
        where('timestamp', '>', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)), // Last 90 days
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as ProfileChange));
    } catch (error) {
      console.error('Error loading profile changes:', error);
      return [];
    }
  };

  // Load recent external indicators from database
  const getRecentIndicators = async (userId: string): Promise<ExternalIndicator[]> => {
    try {
      const q = query(
        collection(db, 'externalIndicators'),
        where('userId', '==', userId),
        where('timestamp', '>', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))), // Last 30 days
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as ExternalIndicator);
    } catch (error) {
      console.error('Error loading indicators:', error);
      return [];
    }
  };

  // Determine if a field change should trigger immediate life event check
  const shouldTriggerImmediateCheck = (field: string): boolean => {
    const immediateFields = [
      'maritalStatus',
      'employmentStatus',
      'address',
      'city',
      'state',
      'numberOfChildren',
      'employer',
      'jobTitle'
    ];
    return immediateFields.includes(field);
  };

  // Set up real-time listener for high-priority external indicators
  useEffect(() => {
    if (!userId) return;

    let unsubscribe: Unsubscribe;

    const setupListener = async () => {
      const q = query(
        collection(db, 'externalIndicators'),
        where('userId', '==', userId),
        where('confidence', '>', 0.9),
        where('timestamp', '>', Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))) // Last 24 hours
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            // New high-confidence indicator detected
            checkForLifeEvents();
          }
        });
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, checkForLifeEvents]);

  // Periodic check for life events (every 7 days)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      checkForLifeEvents();
    }, 7 * 24 * 60 * 60 * 1000); // Weekly

    // Initial check after component mount
    const timeout = setTimeout(() => {
      checkForLifeEvents();
    }, 5000); // 5 seconds after mount

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [userId, checkForLifeEvents]);

  return {
    detectedEvents,
    isTracking,
    trackActivity,
    trackProfileChange,
    trackExternalIndicator,
    checkForLifeEvents
  };
};
