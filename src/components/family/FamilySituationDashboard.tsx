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
import { Progress } from "@/components/ui/progress";
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
      title: t("dashboard-main:family.culturalUpdated"),
      description: t("dashboard-main:family.culturalUpdatedDesc"),
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <StructureIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {t(`family.structures.${familySituation.structure}`)}
                </CardTitle>
                <CardDescription>{t("family.personalized")}</CardDescription>
              </div>
            </div>
            <Badge className={complexityColors[familySituation.complexity]}>
              {t(`family.complexity.${familySituation.complexity}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("family.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="h-4 w-4 mr-2" />
            {t("family.tabs.insights")}
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="h-4 w-4 mr-2" />
            {t("family.tabs.features")}
          </TabsTrigger>
          <TabsTrigger value="cultural">
            <Globe className="h-4 w-4 mr-2" />
            {t("family.tabs.cultural")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("family.keyConsiderations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{consideration}</p>
                    </motion.div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Needs */}
          {familySituation.specialNeeds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("family.specialNeeds")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {familySituation.specialNeeds.map((need) => (
                    <Badge key={need} variant="secondary" className="px-3 py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      {t(`family.needs.${need}`)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sensitivities */}
          {familySituation.sensitivities.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("family.sensitivities")}</AlertTitle>
              <AlertDescription>
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
        <TabsContent value="insights" className="space-y-4">
          <ScrollArea className="h-[600px]">
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
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${getInsightColor(insight.priority)}`}
                            >
                              <InsightIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {insight.title}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {t(`family.insightType.${insight.type}`)}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={getInsightColor(insight.priority)}>
                            {t(`family.priority.${insight.priority}`)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
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
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
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
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("family.recommendedFeaturesTitle")}
              </CardTitle>
              <CardDescription>
                {t("family.recommendedFeaturesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familySituation.recommendedFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {t(`family.features.${feature}.title`)}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {t(`family.features.${feature}.description`)}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communication Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("family.communicationStyle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
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
        <TabsContent value="cultural" className="space-y-4">
          {showCulturalSetup ? (
            <CulturalAdaptation
              culturalContext={culturalContext}
              onUpdate={handleCulturalUpdate}
              onComplete={() => setShowCulturalSetup(false)}
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("family.culturalConsiderations")}
                  </CardTitle>
                  <CardDescription>{t("family.culturalDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {familySituation.culturalConsiderations.length > 0 ? (
                    <div className="space-y-3">
                      {familySituation.culturalConsiderations.map(
                        (consideration, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                          >
                            <Globe className="h-5 w-5 text-purple-600" />
                            <span className="text-sm">
                              {t(`family.cultural.${consideration}`)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {t("family.noCulturalSettings")}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={() => setShowCulturalSetup(true)}
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
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
