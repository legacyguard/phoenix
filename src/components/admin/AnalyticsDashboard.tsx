import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  FunnelChart,
  Funnel,
  LabelList,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Interface definitions
import { useTranslation } from "react-i18next";
interface MetricCard {
  title: string;
  value: number | string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

interface FunnelData {
  stage: string;
  value: number;
  dropoff?: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

// Mock data - will be replaced with API fetch
const mockAnalyticsData = {
  overview: {
    totalUsers: 12847,
    activeUsers: 8432,
    avgSessionDuration: "14:32",
    bounceRate: 23.5,
  },
  userJourney: {
    onboardingCompletionRate: 82,
    firstPossessionAdded: 65,
    firstTrustedPersonAdded: 61,
    firstDocumentUploaded: 58,
    willGenerated: 43,
  },
  featureAdoption: {
    localOnlyModeUsers: 15,
    familyHubUsers: 45,
    documentScannerUsers: 72,
    emergencyAccessSetup: 38,
    pushNotificationsEnabled: 64,
  },
  preparednessStats: {
    averageOverallScore: 68,
    willsCreated: 55,
    documentsUploaded: 8.3, // avg per user
    trustedPeopleAdded: 3.2, // avg per user
  },
  abTestResults: [
    {
      testName: t("analytics.testData.dashboardTitleExperiment"),
      controlConversion: 12.5,
      variationConversion: 14.8,
      winner: t("analytics.testData.variation"),
      confidence: 97,
      sampleSize: 5430,
      duration: 14, // days
    },
    {
      testName: t("analytics.testData.onboardingFlowSimplification"),
      controlConversion: 41.2,
      variationConversion: 52.7,
      winner: t("analytics.testData.variation"),
      confidence: 99.2,
      sampleSize: 3210,
      duration: 21,
    },
  ],

  userSegments: [
    {
      segment: t("analytics.testData.highlyEngaged"),
      percentage: 22,
      description: "Login weekly, >80% preparedness",
    },
    {
      segment: t("analytics.testData.moderatelyEngaged"),
      percentage: 45,
      description: "Login monthly, 40-80% preparedness",
    },
    {
      segment: t("analytics.testData.atRisk"),
      percentage: 25,
      description: "Haven't logged in >30 days",
    },
    {
      segment: t("analytics.testData.dormant"),
      percentage: 8,
      description: "No activity >90 days",
    },
  ],

  timeSeriesData: [
    { date: "2024-01", activeUsers: 5234, newUsers: 892 },
    { date: "2024-02", activeUsers: 6122, newUsers: 1203 },
    { date: "2024-03", activeUsers: 7234, newUsers: 1567 },
    { date: "2024-04", activeUsers: 8122, newUsers: 1832 },
    { date: "2024-05", activeUsers: 8932, newUsers: 1623 },
    { date: "2024-06", activeUsers: 8432, newUsers: 1402 },
  ],
};

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation("dashboard-main");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/analytics");

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Unauthorized access");
          }
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
        // Use mock data as fallback
        setAnalyticsData(mockAnalyticsData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate funnel data
  const funnelData: FunnelData[] = [
    { stage: "Sign Up", value: 100 },
    {
      stage: "Complete Onboarding",
      value: analyticsData.userJourney.onboardingCompletionRate,
      dropoff: 18,
    },
    {
      stage: "Add First Possession",
      value: analyticsData.userJourney.firstPossessionAdded,
      dropoff: 17,
    },
    {
      stage: "Add Trusted Person",
      value: analyticsData.userJourney.firstTrustedPersonAdded,
      dropoff: 4,
    },
    {
      stage: "Upload Document",
      value: analyticsData.userJourney.firstDocumentUploaded,
      dropoff: 3,
    },
    {
      stage: "Generate Will",
      value: analyticsData.userJourney.willGenerated,
      dropoff: 15,
    },
  ];

  // Key metrics for overview cards
  const keyMetrics: MetricCard[] = [
    {
      title: "Total Users",
      value: analyticsData.overview.totalUsers.toLocaleString(),
      change: 12.5,
      trend: "up",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Active Users",
      value: analyticsData.overview.activeUsers.toLocaleString(),
      change: 8.3,
      trend: "up",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: "Avg. Preparedness",
      value: `${analyticsData.preparednessStats.averageOverallScore}%`,
      change: 3.2,
      trend: "up",
      icon: <Target className="h-5 w-5" />,
    },
    {
      title: "Wills Created",
      value: `${analyticsData.preparednessStats.willsCreated}%`,
      change: -2.1,
      trend: "down",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  // Show loading state
  if (isLoading && !analyticsData) {
    return (
      <div className="p-4 md:p-6 font-sans bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t("dashboard.analyticsDashboard.loading_analytics_data_1")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("dashboard.analyticsDashboard.analytics_dashboard_2")}
              </h1>
              <p className="text-gray-600">
                {t(
                  "dashboard.analyticsDashboard.monitor_user_engagement_featur_3",
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                  {t("dashboard.analyticsDashboard.refreshing_4")}
                </div>
              )}
              {error && (
                <Badge variant="outline" className="text-red-600">
                  {t("dashboard.analyticsDashboard.using_cached_data_5")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {keyMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span
                    className={
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-gray-500 ml-1">
                    {t("dashboard.analyticsDashboard.from_last_month_6")}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">
              {t("dashboard.analyticsDashboard.user_journey_7")}
            </TabsTrigger>
            <TabsTrigger value="features">
              {t("dashboard.analyticsDashboard.feature_adoption_8")}
            </TabsTrigger>
            <TabsTrigger value="experiments">
              {t("dashboard.analyticsDashboard.a_b_tests_9")}
            </TabsTrigger>
            <TabsTrigger value="segments">
              {t("dashboard.analyticsDashboard.user_segments_30")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("dashboard.analyticsDashboard.user_growth_11")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "dashboard.analyticsDashboard.active_and_new_users_over_time_12",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer
                    width={t("assets.assetOverview.100_2")}
                    height={300}
                  >
                    <AreaChart data={analyticsData.timeSeriesData}>
                      <CartesianGrid
                        strokeDasharray={t(
                          "analytics.analyticsDashboard.3_3_7",
                        )}
                      />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="activeUsers"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="newUsers"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("dashboard.analyticsDashboard.platform_statistics_15")}
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.analyticsDashboard.key_platform_metrics_16")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t(
                        "dashboard.analyticsDashboard.avg_session_duration_17",
                      )}
                    </span>
                    <span className="text-2xl font-bold">
                      {analyticsData.overview.avgSessionDuration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("dashboard.analyticsDashboard.bounce_rate_18")}
                    </span>
                    <span className="text-2xl font-bold">
                      {analyticsData.overview.bounceRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t(
                        "dashboard.analyticsDashboard.avg_documents_per_user_19",
                      )}
                    </span>
                    <span className="text-2xl font-bold">
                      {analyticsData.preparednessStats.documentsUploaded}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t(
                        "dashboard.analyticsDashboard.avg_trusted_people_per_user_20",
                      )}
                    </span>
                    <span className="text-2xl font-bold">
                      {analyticsData.preparednessStats.trustedPeopleAdded}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Journey Funnel Tab */}
          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("dashboard.analyticsDashboard.user_journey_funnel_21")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "dashboard.analyticsDashboard.track_user_progression_through_22",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((stage, index) => (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {stage.stage}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">
                            {stage.value}%
                          </span>
                          {stage.dropoff && (
                            <Badge variant="outline" className="text-red-600">
                              -{stage.dropoff}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={stage.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Adoption Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("dashboard.analyticsDashboard.feature_adoption_rates_23")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "dashboard.analyticsDashboard.percentage_of_users_using_each_24",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer
                  width={t("assets.assetOverview.100_2")}
                  height={400}
                >
                  <BarChart
                    data={Object.entries(analyticsData.featureAdoption).map(
                      ([name, value]) => ({
                        name: name.replace(/([A-Z])/g, " $1").trim(),
                        value,
                      }),
                    )}
                    layout="horizontal"
                  >
                    <CartesianGrid
                      strokeDasharray={t("analytics.analyticsDashboard.3_3_7")}
                    />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#8b5cf6">
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value) => `${value}%`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* A/B Tests Tab */}
          <TabsContent value="experiments" className="space-y-4">
            <div className="grid gap-4">
              {analyticsData.abTestResults.map((test, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{test.testName}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        {test.winner} Won
                      </Badge>
                    </div>
                    <CardDescription>
                      {t("dashboard.analyticsDashboard.sample_size_27")}
                      {test.sampleSize.toLocaleString()}
                      {t("dashboard.analyticsDashboard.users_duration_28")}
                      {test.duration} days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-1">Control</p>
                        <p className="text-2xl font-bold">
                          {test.controlConversion}%
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50">
                        <p className="text-sm text-gray-600 mb-1">Variation</p>
                        <p className="text-2xl font-bold text-green-700">
                          {test.variationConversion}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      <Badge variant="outline">
                        {test.confidence}
                        {t("dashboard.analyticsDashboard.confidence_29")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Segments Tab */}
          <TabsContent value="segments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("dashboard.analyticsDashboard.user_segments_30")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "dashboard.analyticsDashboard.user_distribution_by_engagemen_31",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userSegments.map((segment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">{segment.segment}</p>
                        <p className="text-sm text-gray-600">
                          {segment.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {segment.percentage}%
                        </p>
                        <Progress
                          value={segment.percentage}
                          className="w-24 h-2 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
