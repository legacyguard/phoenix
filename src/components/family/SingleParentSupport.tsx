import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Users,
  Shield,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  ChevronRight,
  HelpCircle,
  Calendar,
  FileText,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  role: "primary" | "backup" | "emergency";
  strengths: string[];
  availability: string;
  notes?: string;
}

interface EmergencyPlan {
  scenario: string;
  steps: string[];
  contacts: string[];
}

export const SingleParentSupport: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [emergencyPlans, setEmergencyPlans] = useState<EmergencyPlan[]>([]);
  const [activeTab, setActiveTab] = useState("network");

  const handleAddGuardian = (guardian: Guardian) => {
    setGuardians([...guardians, guardian]);
    setShowAddGuardian(false);

    toast({
      title: t("common:singleParent.guardianAdded"),
      description: t("common:singleParent.guardianAddedDesc", {
        name: guardian.name,
      }),
    });
  };

  const getGuardianIcon = (role: Guardian["role"]) => {
    switch (role) {
      case "primary":
        return Star;
      case "backup":
        return Shield;
      case "emergency":
        return Phone;
      default:
        return Users;
    }
  };

  const getGuardianColor = (role: Guardian["role"]) => {
    switch (role) {
      case "primary":
        return "text-yellow-600 bg-yellow-100";
      case "backup":
        return "text-blue-600 bg-blue-100";
      case "emergency":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-full">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <CardTitle>{t("singleParent.title")}</CardTitle>
              <CardDescription>{t("singleParent.description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              {t("singleParent.encouragement")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network">
            <Users className="h-4 w-4 mr-2" />
            {t("singleParent.tabs.network")}
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <AlertCircle className="h-4 w-4 mr-2" />
            {t("singleParent.tabs.emergency")}
          </TabsTrigger>
          <TabsTrigger value="resources">
            <HelpCircle className="h-4 w-4 mr-2" />
            {t("singleParent.tabs.resources")}
          </TabsTrigger>
        </TabsList>

        {/* Guardian Network Tab */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {t("singleParent.guardianNetwork")}
                  </CardTitle>
                  <CardDescription>
                    {t("singleParent.guardianNetworkDesc")}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddGuardian(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("singleParent.addGuardian")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {guardians.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {t("singleParent.noGuardians")}
                  </p>
                  <Button
                    onClick={() => setShowAddGuardian(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    {t("singleParent.startBuilding")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {guardians.map((guardian, index) => {
                    const GuardianIcon = getGuardianIcon(guardian.role);
                    return (
                      <motion.div
                        key={guardian.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-full ${getGuardianColor(guardian.role)}`}
                                >
                                  <GuardianIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {guardian.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {guardian.relationship}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {guardian.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {guardian.availability}
                                    </span>
                                  </div>
                                  {guardian.strengths.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {guardian.strengths.map((strength) => (
                                        <Badge
                                          key={strength}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {strength}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {t(`singleParent.roles.${guardian.role}`)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {guardians.length > 0 && guardians.length < 3 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("singleParent.needMoreGuardians")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Guardian Strength Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("singleParent.networkStrength")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">
                      {t("singleParent.coverage")}
                    </span>
                    <span className="text-sm font-medium">
                      {Math.min(100, guardians.length * 33)}%
                    </span>
                  </div>
                  <Progress value={Math.min(100, guardians.length * 33)} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${guardians.some((g) => g.role === "primary") ? "text-green-600" : "text-gray-300"}`}
                    />
                    <span>{t("singleParent.primaryGuardian")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${guardians.some((g) => g.role === "backup") ? "text-green-600" : "text-gray-300"}`}
                    />
                    <span>{t("singleParent.backupGuardian")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${guardians.some((g) => g.role === "emergency") ? "text-green-600" : "text-gray-300"}`}
                    />
                    <span>{t("singleParent.emergencyContact")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${guardians.length >= 3 ? "text-green-600" : "text-gray-300"}`}
                    />
                    <span>{t("singleParent.multipleOptions")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Planning Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("singleParent.emergencyPlanning")}
              </CardTitle>
              <CardDescription>
                {t("singleParent.emergencyPlanningDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Emergency Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">
                        {t("singleParent.ifHospitalized")}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>1. {t("singleParent.contactPrimary")}</p>
                        <p>2. {t("singleParent.childrenLocation")}</p>
                        <p>3. {t("singleParent.medicalInfo")}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">
                        {t("singleParent.ifTraveling")}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>1. {t("singleParent.travelItinerary")}</p>
                        <p>2. {t("singleParent.guardianSchedule")}</p>
                        <p>3. {t("singleParent.emergencyFunds")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency Documents */}
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    {t("singleParent.importantDocs")}
                  </AlertDescription>
                </Alert>

                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  {t("singleParent.createEmergencyBinder")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("singleParent.resources.legal")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {t("singleParent.resources.guardianshipLaws")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {t("singleParent.resources.temporaryGuardianship")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {t("singleParent.resources.schoolAuthorization")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("singleParent.resources.support")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {t("singleParent.resources.localGroups")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {t("singleParent.resources.onlineCommunity")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {t("singleParent.resources.counseling")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Guardian Modal */}
      {showAddGuardian && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{t("singleParent.addNewGuardian")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("singleParent.guardianName")}</Label>
                    <Input
                      placeholder={t("singleParent.guardianNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label>{t("singleParent.relationship")}</Label>
                    <Input
                      placeholder={t("singleParent.relationshipPlaceholder")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("singleParent.phone")}</Label>
                    <Input
                      type="tel"
                      placeholder={t("singleParent.phonePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label>{t("singleParent.email")}</Label>
                    <Input
                      type="email"
                      placeholder={t("singleParent.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div>
                  <Label>{t("singleParent.role")}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      {t("singleParent.roles.primary")}
                    </Button>
                    <Button variant="outline" size="sm">
                      {t("singleParent.roles.backup")}
                    </Button>
                    <Button variant="outline" size="sm">
                      {t("singleParent.roles.emergency")}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>{t("singleParent.strengths")}</Label>
                  <Textarea
                    placeholder={t("singleParent.strengthsPlaceholder")}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddGuardian(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => {
                  // In real implementation, collect form data
                  handleAddGuardian({
                    id: Date.now().toString(),
                    name: "Example Guardian",
                    relationship: "Close Friend",
                    phone: "555-1234",
                    email: "guardian@example.com",
                    role: "primary",
                    strengths: ["Trustworthy", "Available weekends"],
                    availability: "Weekends and evenings",
                  });
                }}
              >
                {t("singleParent.saveGuardian")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};
