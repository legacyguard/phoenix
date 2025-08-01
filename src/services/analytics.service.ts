// Analytics service for fetching admin analytics data

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    avgSessionDuration: string;
    bounceRate: number;
  };
  userJourney: {
    onboardingCompletionRate: number;
    firstPossessionAdded: number;
    firstTrustedPersonAdded: number;
    firstDocumentUploaded: number;
    willGenerated: number;
  };
  featureAdoption: {
    localOnlyModeUsers: number;
    familyHubUsers: number;
    documentScannerUsers: number;
    emergencyAccessSetup: number;
    pushNotificationsEnabled: number;
  };
  preparednessStats: {
    averageOverallScore: number;
    willsCreated: number;
    documentsUploaded: number;
    trustedPeopleAdded: number;
  };
  abTestResults: Array<{
    testName: string;
    controlConversion: number;
    variationConversion: number;
    winner: string;
    confidence: number;
    sampleSize: number;
    duration: number;
  }>;
  userSegments: Array<{
    segment: string;
    percentage: number;
    description: string;
  }>;
  timeSeriesData: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const response = await fetch('/api/admin/analytics', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
};

// Export as namespace for compatibility
export const analyticsService = {
  fetchAnalytics,
};
