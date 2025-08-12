import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Heart,
  Shield,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  Sparkles,
  Baby,
  Home,
  Briefcase,
  Globe,
  Star,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  FamilySituation,
  FamilyInsight,
  FamilyData,
  UserPreferences,
  CulturalContext,
  FamilySituationAnalysisService,
} from "@/services/familySituationAnalysis";
import { CulturalAdaptation } from "../cultural/CulturalAdaptation";
import { useToast } from "@/components/ui/use-toast";

interface FamilySituationDashboardProps {
  familyData: FamilyData;
  userPreferences: UserPreferences;
  culturalContext: CulturalContext;
  onUpdateCulturalContext?: (context: CulturalContext) => void;
}

const structureIcons = {
  nuclear: Home,
  single_parent: Heart,
  blended: Users,
  multigenerational: Users,
  childless: Heart,
  empty_nest: Home,
  non_traditional: Star,
};

const complexityColors = {
  simple: "text-green-600 bg-green-100",
  moderate: "text-yellow-600 bg-yellow-100",
  complex: "text-red-600 bg-red-100",
};

export const FamilySituationDashboard: React.FC<
  FamilySituationDashboardProps
> = ({
  familyData,
  userPreferences,
  culturalContext,
  onUpdateCulturalContext,
}) => {
  const { userId } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [familySituation, setFamilySituation] =
    useState<FamilySituation | null>(null);
  const [insights, setInsights] = useState<FamilyInsight[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCulturalSetup, setShowCulturalSetup] = useState(false);

  const analyzeFamilySituation = useCallback(() => {
    const situation = FamilySituationAnalysisService.analyzeFamilySituation(
      familyData,
      userPreferences,
      culturalContext,
    );
    setFamilySituation(situation);

    const generatedInsights =
      FamilySituationAnalysisService.generateFamilyInsights(
        situation,
        familyData,
      );
    setInsights(generatedInsights);

    // Save analysis if user is logged in
    if (userId) {
      FamilySituationAnalysisService.saveFamilySituation(
        userId,
        situation,
        generatedInsights,
      );
    }
  }, [familyData, userPreferences, culturalContext, userId]);

  useEffect(() => {
    analyzeFamilySituation();
  }, [analyzeFamilySituation]);

  const handleCulturalUpdate = (newContext: CulturalContext) => {
    onUpdateCulturalContext?.(newContext);
    setShowCulturalSetup(false);
    analyzeFamilySituation();

    toast({
      title: t("family.culturalUpdated"),
      description: t("family.culturalUpdatedDesc"),
    });
  };

  if (!familySituation) {
    return <div>Loading family analysis...</div>;
  }

  const StructureIcon = structureIcons[familySituation.structure] || Home;

  const getInsightIcon = (type: FamilyInsight["type"]) => {
    switch (type) {
      case "structure":
        return Users;
      case "need":
        return AlertCircle;
      case "opportunity":
        return Sparkles;
      case "risk":
        return Shield;
      default:
        return Info;
    }
  };

  const getInsightColor = (priority: FamilyInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card data-testid="familysituationdashboard-card">
        <CardHeader data-testid="familysituationdashboard-cardheader">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <StructureIcon className="h-6 w-6 text-blue-600" data-testid="familysituationdashboard-structureicon" />
              </div>
              <div>
                <CardTitle className="text-2xl" data-testid="familysituationdashboard-cardtitle">
                  {t(`family.structures.${familySituation.structure}`)}
                </CardTitle>
                <CardDescription data-testid="familysituationdashboard-t-ui-common-family-personalized">
                  {t("ui-common:family.personalized")}
                </CardDescription>
              </div>
            </div>
            <Badge className={complexityColors[familySituation.complexity]} data-testid="familysituationdashboard-badge">
              {t(`family.complexity.${familySituation.complexity}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent data-testid="familysituationdashboard-key-stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key Stats */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {familyData.members.length}
              </div>
              <div className="text-sm text-gray-600">
                {t("family.familyMembers")}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {familySituation.specialNeeds.length}
              </div>
              <div className="text-sm text-gray-600">
                {t("family.specialConsiderations")}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {familySituation.recommendedFeatures.length}
              </div>
              <div className="text-sm text-gray-600">
                {t("family.recommendedFeatures")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="familysituationdashboard-tabs">
        <TabsList className="grid w-full grid-cols-4" data-testid="familysituationdashboard-tabslist">
          <TabsTrigger value="overview" data-testid="familysituationdashboard-tabstrigger">
            <BarChart3 className="h-4 w-4 mr-2" data-testid="familysituationdashboard-barchart3" />
            {t("ui-common:family.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="familysituationdashboard-tabstrigger">
            <Sparkles className="h-4 w-4 mr-2" data-testid="familysituationdashboard-sparkles" />
            {t("ui-common:family.tabs.insights")}
          </TabsTrigger>
          <TabsTrigger value="features" data-testid="familysituationdashboard-tabstrigger">
            <Settings className="h-4 w-4 mr-2" data-testid="familysituationdashboard-settings" />
            {t("ui-common:family.tabs.features")}
          </TabsTrigger>
          <TabsTrigger value="cultural" data-testid="familysituationdashboard-tabstrigger">
            <Globe className="h-4 w-4 mr-2" data-testid="familysituationdashboard-globe" />
            {t("ui-common:family.tabs.cultural")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4" data-testid="familysituationdashboard-tabscontent">
          <Card data-testid="familysituationdashboard-card">
            <CardHeader data-testid="familysituationdashboard-cardheader">
              <CardTitle className="text-lg" data-testid="familysituationdashboard-t-family-keyconsiderations">
                {t("family.keyConsiderations")}
              </CardTitle>
            </CardHeader>
            <CardContent data-testid="familysituationdashboard-control">
              <div className="space-y-3">
                {familySituation.keyConsiderations.map(
                  (consideration, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" data-testid="familysituationdashboard-checkcircle2" />
                      <p className="text-sm text-gray-700">{consideration}</p>
                    </motion.div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Needs */}
          {familySituation.specialNeeds.length > 0 && (
            <Card data-testid="familysituationdashboard-card">
              <CardHeader data-testid="familysituationdashboard-cardheader">
                <CardTitle className="text-lg" data-testid="familysituationdashboard-t-family-specialneeds">
                  {t("family.specialNeeds")}
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="familysituationdashboard-control">
                <div className="flex flex-wrap gap-2">
                  {familySituation.specialNeeds.map((need) => (
                    <Badge key={need} variant="secondary" className="px-3 py-1" data-testid="familysituationdashboard-badge">
                      <Shield className="h-3 w-3 mr-1" data-testid="familysituationdashboard-shield" />
                      {t(`family.needs.${need}`)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sensitivities */}
          {familySituation.sensitivities.length > 0 && (
            <Alert data-testid="familysituationdashboard-alert">
              <AlertCircle className="h-4 w-4" data-testid="familysituationdashboard-alertcircle" />
              <AlertTitle data-testid="familysituationdashboard-t-ui-common-family-sensitivities">{t("ui-common:family.sensitivities")}</AlertTitle>
              <AlertDescription data-testid="familysituationdashboard-control">
                <ul className="mt-2 space-y-1">
                  {familySituation.sensitivities.map((sensitivity) => (
                    <li key={sensitivity} className="text-sm">
                      • {t(`family.sensitivity.${sensitivity}`)}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4" data-testid="familysituationdashboard-tabscontent">
          <ScrollArea className="h-[600px]" data-testid="familysituationdashboard-scrollarea">
            <div className="space-y-4 pr-4">
              {insights.map((insight, index) => {
                const InsightIcon = getInsightIcon(insight.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card data-testid="familysituationdashboard-card">
                      <CardHeader data-testid="familysituationdashboard-cardheader">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${getInsightColor(insight.priority)}`}
                            >
                              <InsightIcon className="h-5 w-5" data-testid="familysituationdashboard-insighticon" />
                            </div>
                            <div>
                              <CardTitle className="text-lg" data-testid="familysituationdashboard-insight-title">
                                {insight.title}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1" data-testid="familysituationdashboard-badge">
                                {t(`family.insightType.${insight.type}`)}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={getInsightColor(insight.priority)} data-testid="familysituationdashboard-badge">
                            {t(`family.priority.${insight.priority}`)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent data-testid="familysituationdashboard-0">
                        <p className="text-sm text-gray-600 mb-4">
                          {insight.description}
                        </p>
                        {insight.suggestedActions &&
                          insight.suggestedActions.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                {t("family.suggestedActions")}:
                              </p>
                              <div className="space-y-1">
                                {insight.suggestedActions.map(
                                  (action, actionIndex) => (
                                    <div
                                      key={actionIndex}
                                      className="flex items-center gap-2"
                                    >
                                      <ChevronRight className="h-4 w-4 text-gray-400" data-testid="familysituationdashboard-chevronright" />
                                      <span className="text-sm">{action}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4" data-testid="familysituationdashboard-tabscontent">
          <Card data-testid="familysituationdashboard-card">
            <CardHeader data-testid="familysituationdashboard-cardheader">
              <CardTitle className="text-lg" data-testid="familysituationdashboard-t-family-recommendedfeaturestitle">
                {t("family.recommendedFeaturesTitle")}
              </CardTitle>
              <CardDescription data-testid="familysituationdashboard-t-family-recommendedfeaturesdesc">
                {t("family.recommendedFeaturesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent data-testid="familysituationdashboard-control">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familySituation.recommendedFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="familysituationdashboard-card">
                      <CardContent className="p-4" data-testid="familysituationdashboard-cardcontent">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-600" data-testid="familysituationdashboard-sparkles" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {t(`family.features.${feature}.title`)}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {t(`family.features.${feature}.description`)}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" data-testid="familysituationdashboard-chevronright" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communication Style */}
          <Card data-testid="familysituationdashboard-card">
            <CardHeader data-testid="familysituationdashboard-cardheader">
              <CardTitle className="text-lg" data-testid="familysituationdashboard-t-family-communicationstyle">
                {t("family.communicationStyle")}
              </CardTitle>
            </CardHeader>
            <CardContent data-testid="familysituationdashboard-cardcontent">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" data-testid="familysituationdashboard-bookopen" />
                  <span className="font-medium">
                    {t(
                      `family.communication.${familySituation.communicationStyle}`,
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {t(
                    `family.communication.${familySituation.communicationStyle}Desc`,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cultural Tab */}
        <TabsContent value="cultural" className="space-y-4" data-testid="familysituationdashboard-showculturalsetup">
          {showCulturalSetup ? (
            <CulturalAdaptation
              culturalContext={culturalContext}
              onUpdate={handleCulturalUpdate}
              onComplete={() => setShowCulturalSetup(false)} data-testid="familysituationdashboard-culturaladaptation"
            />
          ) : (
            <>
              <Card data-testid="familysituationdashboard-card">
                <CardHeader data-testid="familysituationdashboard-cardheader">
                  <CardTitle className="text-lg" data-testid="familysituationdashboard-t-family-culturalconsiderations">
                    {t("family.culturalConsiderations")}
                  </CardTitle>
                  <CardDescription data-testid="familysituationdashboard-t-family-culturaldesc">{t("family.culturalDesc")}</CardDescription>
                </CardHeader>
                <CardContent data-testid="familysituationdashboard-0">
                  {familySituation.culturalConsiderations.length > 0 ? (
                    <div className="space-y-3">
                      {familySituation.culturalConsiderations.map(
                        (consideration, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                          >
                            <Globe className="h-5 w-5 text-purple-600" data-testid="familysituationdashboard-globe" />
                            <span className="text-sm">
                              {t(`family.cultural.${consideration}`)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <Alert data-testid="familysituationdashboard-alert">
                      <Info className="h-4 w-4" data-testid="familysituationdashboard-info" />
                      <AlertDescription data-testid="familysituationdashboard-t-family-noculturalsettings">
                        {t("family.noCulturalSettings")}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={() => setShowCulturalSetup(true)}
                    className="mt-4 w-full"
                    variant="outline" data-testid="familysituationdashboard-button"
                  >
                    <Settings className="h-4 w-4 mr-2" data-testid="familysituationdashboard-settings" />
                    {t("family.configureCultural")}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
