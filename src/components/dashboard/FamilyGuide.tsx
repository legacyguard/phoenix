import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FamilyGuideProps {
  guardians: Array<Record<string, unknown>>;
  documents: Array<Record<string, unknown>>;
  assets: Array<Record<string, unknown>>;
  beneficiaries: Array<Record<string, unknown>>;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: "immediate" | "within24h" | "within7days";
}

interface DocumentLocation {
  name: string;
  location: string;
  importance: "critical" | "important" | "reference";
}

export const FamilyGuide: React.FC<FamilyGuideProps> = ({
  guardians,
  documents,
  assets,
  beneficiaries,
}) => {
  const { t } = useTranslation("family-core");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDiscreteMode, setIsDiscreteMode] = useState(false);

  const generateEmergencyContacts = (): EmergencyContact[] => {
    const contacts: EmergencyContact[] = [];

    // Add guardians as immediate contacts
    guardians.forEach((guardian) => {
      contacts.push({
        name: guardian.full_name,
        relationship: guardian.relationship,
        phone: guardian.phone || "Not provided",
        email: guardian.email,
        priority: "immediate",
      });
    });

    // Add critical service contacts
    contacts.push({
      name: "Local Police",
      relationship: "Emergency Services",
      phone: "911",
      priority: "immediate",
    });

    contacts.push({
      name: "Family Doctor",
      relationship: "Medical",
      phone: "Contact family doctor",
      priority: "within24h",
    });

    return contacts;
  };

  const generateDocumentLocations = (): DocumentLocation[] => {
    const locations: DocumentLocation[] = [];

    // Group documents by importance
    const criticalDocs = documents.filter(
      (doc) => doc.importance_level === "critical",
    );
    const importantDocs = documents.filter(
      (doc) => doc.importance_level === "important",
    );

    criticalDocs.forEach((doc) => {
      locations.push({
        name: doc.title,
        location: "LegacyGuard Vault",
        importance: "critical",
      });
    });

    importantDocs.forEach((doc) => {
      locations.push({
        name: doc.title,
        location: "LegacyGuard Vault",
        importance: "important",
      });
    });

    return locations;
  };

  const generateTimeline = () => {
    return [
      {
        time: "Immediate (0-24 hours)",
        tasks: [
          "Contact emergency services if needed",
          "Notify immediate family members",
          "Contact funeral home",
          "Secure the home and valuables",
          "Locate and review the will",
        ],
      },
      {
        time: "Within 7 days",
        tasks: [
          "Obtain death certificates (multiple copies)",
          "Contact life insurance companies",
          "Notify banks and financial institutions",
          "Contact employer for benefits",
          "Begin probate process if necessary",
        ],
      },
      {
        time: "Within 30 days",
        tasks: [
          "File tax returns",
          "Transfer vehicle titles",
          "Update utility accounts",
          "Cancel subscriptions and memberships",
          "Begin estate distribution process",
        ],
      },
    ];
  };

  const exportGuide = () => {
    const guideContent = {
      title: "Family Emergency Guide",
      generated: new Date().toISOString(),
      emergencyContacts: generateEmergencyContacts(),
      documentLocations: generateDocumentLocations(),
      timeline: generateTimeline(),
      assets: assets,
      beneficiaries: beneficiaries,
    };

    const blob = new Blob([JSON.stringify(guideContent, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-emergency-guide.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleDiscreteMode = () => {
    setIsDiscreteMode(!isDiscreteMode);
    // Store preference in localStorage
    localStorage.setItem(
      "legacyguard-discrete-mode",
      (!isDiscreteMode).toString(),
    );
  };

  useEffect(() => {
    const discreteMode =
      localStorage.getItem("legacyguard-discrete-mode") === "true";
    setIsDiscreteMode(discreteMode);
  }, []);

  return (
    <>
      <Card className={isDiscreteMode ? "bg-gray-50 border-gray-200" : ""} data-testid="familyguide-card">
        <CardHeader data-testid="familyguide-cardheader">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" data-testid="familyguide-isdiscretemode">
              {isDiscreteMode ? (
                <>
                  <FileText className="h-5 w-5" data-testid="familyguide-filetext" />
                  <span className="text-gray-600">
                    {t("dashboard.familyGuide.discreteMode")}
                  </span>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5" data-testid="familyguide-users" />
                  <span>{t("dashboard.familyGuide.title")}</span>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDiscreteMode}
                className="h-8 w-8 p-0" data-testid="familyguide-isdiscretemode"
              >
                {isDiscreteMode ? (
                  <Eye className="h-4 w-4" data-testid="familyguide-eye" />
                ) : (
                  <EyeOff className="h-4 w-4" data-testid="familyguide-eyeoff" />
                )}
              </Button>
              <Sheet open={isGuideOpen} onOpenChange={setIsGuideOpen} data-testid="familyguide-sheet">
                <SheetTrigger asChild data-testid="familyguide-sheettrigger">
                  <Button variant="outline" size="sm" data-testid="familyguide-button">
                    <FileText className="mr-2 h-4 w-4" data-testid="familyguide-filetext" />
                    {isDiscreteMode
                      ? t("dashboard.familyGuide.view")
                      : t("dashboard.familyGuide.generateGuide")}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto" data-testid="familyguide-sheetcontent">
                  <SheetHeader data-testid="familyguide-t-dashboard-familyguide-title">
                    <SheetTitle data-testid="familyguide-t-dashboard-familyguide-title">{t("dashboard.familyGuide.title")}</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Emergency Contacts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-red-600" data-testid="familyguide-phone" />
                        {t("dashboard.familyGuide.emergency_contacts_1")}
                      </h3>
                      <div className="space-y-2">
                        {generateEmergencyContacts().map((contact, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{contact.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {contact.relationship}
                                </p>
                                <p className="text-sm">{contact.phone}</p>
                              </div>
                              <Badge
                                variant={
                                  contact.priority === "immediate"
                                    ? "destructive"
                                    : "secondary"
                                } data-testid="familyguide-badge"
                              >
                                {contact.priority === "immediate"
                                  ? "Call Now"
                                  : "Call Soon"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Document Locations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" data-testid="familyguide-filetext" />
                        {t("dashboard.familyGuide.important_documents_2")}
                      </h3>
                      <div className="space-y-2">
                        {generateDocumentLocations().map((doc, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.location}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  doc.importance === "critical"
                                    ? "destructive"
                                    : "secondary"
                                } data-testid="familyguide-doc-importance"
                              >
                                {doc.importance}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" data-testid="familyguide-clock" />
                        {t("dashboard.familyGuide.what_to_do_when_3")}
                      </h3>
                      <div className="space-y-4">
                        {generateTimeline().map((period, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{period.time}</h4>
                            <ul className="space-y-1">
                              {period.tasks.map((task, taskIndex) => (
                                <li
                                  key={taskIndex}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" data-testid="familyguide-checkcircle2" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={exportGuide} className="flex-1" data-testid="familyguide-button">
                        <Download className="mr-2 h-4 w-4" data-testid="familyguide-download" />
                        {t("dashboard.familyGuide.export_guide_4")}
                      </Button>
                      <Button variant="outline" className="flex-1" data-testid="familyguide-button">
                        <Share2 className="mr-2 h-4 w-4" data-testid="familyguide-share2" />
                        {t("dashboard.familyGuide.share_with_family_5")}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent data-testid="familyguide-cardcontent">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isDiscreteMode
                    ? t("dashboard.familyGuide.discreteModeDesc")
                    : t("dashboard.familyGuide.subtitle")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.familyGuide.last_updated_6")}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs" data-testid="familyguide-guardians-length-contacts">
                    {guardians.length} contacts
                  </Badge>
                  <Badge variant="outline" className="text-xs" data-testid="familyguide-documents-length-documents">
                    {documents.length} documents
                  </Badge>
                </div>
              </div>
            </div>

            {guardians.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" data-testid="familyguide-alerttriangle" />
                <p className="text-sm">
                  {isDiscreteMode
                    ? "Add important contacts to your notes"
                    : "Add guardians to generate emergency contacts"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
