import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  FileText,
  Heart,
  Shield,
  MessageSquare,
  Home,
} from "lucide-react";

interface ImportantContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notes?: string;
}

interface GuardianPlaybookData {
  id?: string;
  funeral_wishes: string;
  digital_accounts_shutdown: string;
  important_contacts: ImportantContact[];
  document_locations: string;
  personal_messages: string;
  practical_instructions: string;
  updated_at?: string;
}

interface GuardianPlaybookProps {
  userId: string;
  guardianId: string;
  guardianName: string;
  isReadOnly?: boolean;
}

export default function GuardianPlaybook({
  userId,
  guardianId,
  guardianName,
  isReadOnly = false,
}: GuardianPlaybookProps) {
  const { t } = useTranslation("family-core");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playbook, setPlaybook] = useState<GuardianPlaybookData>({
    funeral_wishes: "",
    digital_accounts_shutdown: "",
    important_contacts: [],
    document_locations: "",
    personal_messages: "",
    practical_instructions: "",
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("funeral");

  const fetchPlaybook = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("guardian_playbooks")
        .select("*")
        .eq("user_id", userId)
        .eq("guardian_id", guardianId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setPlaybook({
          ...data,
          important_contacts: data.important_contacts || [],
        });
      }
    } catch (error) {
      console.error("Error fetching playbook:", error);
      toast.error(t("family.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [userId, guardianId, t]);

  useEffect(() => {
    fetchPlaybook();
  }, [userId, guardianId, fetchPlaybook]);

  const savePlaybook = async () => {
    try {
      setSaving(true);

      const playbookData = {
        user_id: userId,
        guardian_id: guardianId,
        funeral_wishes: playbook.funeral_wishes,
        digital_accounts_shutdown: playbook.digital_accounts_shutdown,
        important_contacts: playbook.important_contacts,
        document_locations: playbook.document_locations,
        personal_messages: playbook.personal_messages,
        practical_instructions: playbook.practical_instructions,
      };

      const { error } = await supabase
        .from("guardian_playbooks")
        .upsert(playbookData, {
          onConflict: "user_id,guardian_id",
        });

      if (error) throw error;

      toast.success(t("family.saveSuccess"));
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving playbook:", error);
      toast.error(t("family.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    field: keyof GuardianPlaybookData,
    value: Record<string, unknown>,
  ) => {
    setPlaybook((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addContact = () => {
    const newContact: ImportantContact = {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      notes: "",
    };
    updateField("important_contacts", [
      ...playbook.important_contacts,
      newContact,
    ]);
  };

  const updateContact = (
    index: number,
    field: keyof ImportantContact,
    value: string,
  ) => {
    const updatedContacts = [...playbook.important_contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    updateField("important_contacts", updatedContacts);
  };

  const removeContact = (index: number) => {
    const updatedContacts = playbook.important_contacts.filter(
      (_, i) => i !== index,
    );
    updateField("important_contacts", updatedContacts);
  };

  const getPlaybookStatus = () => {
    const fields = [
      playbook.funeral_wishes,
      playbook.digital_accounts_shutdown,
      playbook.document_locations,
      playbook.personal_messages,
      playbook.practical_instructions,
    ];

    const filledFields = fields.filter(
      (field) => field && field.trim() !== "",
    ).length;
    const hasContacts = playbook.important_contacts.length > 0;

    if (filledFields === 5 && hasContacts) {
      return "complete";
    } else if (filledFields > 0 || hasContacts) {
      return "draft";
    }
    return "empty";
  };

  const tabIcons = {
    funeral: Heart,
    digital: Shield,
    contacts: User,
    documents: FileText,
    messages: MessageSquare,
    instructions: Home,
  };

  if (loading) {
    return (
      <Card data-testid="guardianplaybook-card">
        <CardContent className="flex items-center justify-center h-64" data-testid="guardianplaybook-t-ui-common-family-loading">
          <p className="text-muted-foreground">
            {t("ui-common:family.loading")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderContent = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="guardianplaybook-control">
      <TabsList className="grid grid-cols-6 w-full" data-testid="guardianplaybook-object-entries-tabicons-map-key-icon">
        {Object.entries(tabIcons).map(([key, Icon]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="flex items-center gap-2" data-testid="guardianplaybook-tabstrigger"
          >
            <Icon className="h-4 w-4" data-testid="guardianplaybook-icon" />
            <span className="hidden sm:inline">{t("family.tabs.${key}")}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="funeral" className="space-y-4" data-testid="guardianplaybook-tabscontent">
        <div>
          <Label htmlFor="funeral_wishes" data-testid="guardianplaybook-t-family-funeralwishes-label">
            {t("family.funeralWishes.label")}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t("family.funeralWishes.description")}
          </p>
          <Textarea
            id="funeral_wishes"
            value={playbook.funeral_wishes}
            onChange={(e) => updateField("funeral_wishes", e.target.value)}
            placeholder={t("family.funeralWishes.placeholder")}
            className="min-h-[200px]"
            disabled={isReadOnly || previewMode} data-testid="guardianplaybook-textarea"
          />
        </div>
      </TabsContent>

      <TabsContent value="digital" className="space-y-4" data-testid="guardianplaybook-tabscontent">
        <div>
          <Label htmlFor="digital_accounts" data-testid="guardianplaybook-t-family-digitalaccounts-label">
            {t("family.digitalAccounts.label")}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t("family.digitalAccounts.description")}
          </p>
          <Textarea
            id="digital_accounts"
            value={playbook.digital_accounts_shutdown}
            onChange={(e) =>
              updateField("digital_accounts_shutdown", e.target.value)
            }
            placeholder={t("family.digitalAccounts.placeholder")}
            className="min-h-[200px]"
            disabled={isReadOnly || previewMode} data-testid="guardianplaybook-textarea"
          />
        </div>
      </TabsContent>

      <TabsContent value="contacts" className="space-y-4" data-testid="guardianplaybook-tabscontent">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Label data-testid="guardianplaybook-t-family-importantcontacts-label">{t("family.importantContacts.label")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("family.importantContacts.description")}
              </p>
            </div>
            {!isReadOnly && !previewMode && (
              <Button onClick={addContact} size="sm" variant="outline" data-testid="guardianplaybook-button">
                <Plus className="h-4 w-4 mr-2" data-testid="guardianplaybook-plus" />
                {t("family.importantContacts.add")}
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px] pr-4" data-testid="guardianplaybook-control">
            <div className="space-y-4">
              {playbook.important_contacts.map((contact, index) => (
                <Card key={index} data-testid="guardianplaybook-card">
                  <CardContent className="p-4" data-testid="guardianplaybook-cardcontent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`contact-name-${index}`} data-testid="guardianplaybook-label">
                          {t("family.importantContacts.name")}
                        </Label>
                        <Input
                          id={`contact-name-${index}`}
                          value={contact.name}
                          onChange={(e) =>
                            updateContact(index, "name", e.target.value)
                          }
                          placeholder={t(
                            "family.importantContacts.namePlaceholder",
                          )}
                          disabled={isReadOnly || previewMode} data-testid="guardianplaybook-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contact-relationship-${index}`} data-testid="guardianplaybook-label">
                          {t("family.importantContacts.relationship")}
                        </Label>
                        <Input
                          id={`contact-relationship-${index}`}
                          value={contact.relationship}
                          onChange={(e) =>
                            updateContact(index, "relationship", e.target.value)
                          }
                          placeholder={t(
                            "family.importantContacts.relationshipPlaceholder",
                          )}
                          disabled={isReadOnly || previewMode} data-testid="guardianplaybook-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contact-phone-${index}`} data-testid="guardianplaybook-label">
                          {t("family.importantContacts.phone")}
                        </Label>
                        <Input
                          id={`contact-phone-${index}`}
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            updateContact(index, "phone", e.target.value)
                          }
                          placeholder={t(
                            "family.importantContacts.phonePlaceholder",
                          )}
                          disabled={isReadOnly || previewMode} data-testid="guardianplaybook-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contact-email-${index}`} data-testid="guardianplaybook-label">
                          {t("family.importantContacts.email")}
                        </Label>
                        <Input
                          id={`contact-email-${index}`}
                          type="email"
                          value={contact.email}
                          onChange={(e) =>
                            updateContact(index, "email", e.target.value)
                          }
                          placeholder={t(
                            "family.importantContacts.emailPlaceholder",
                          )}
                          disabled={isReadOnly || previewMode} data-testid="guardianplaybook-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`contact-notes-${index}`} data-testid="guardianplaybook-label">
                          {t("family.importantContacts.notes")}
                        </Label>
                        <Textarea
                          id={`contact-notes-${index}`}
                          value={contact.notes || ""}
                          onChange={(e) =>
                            updateContact(index, "notes", e.target.value)
                          }
                          placeholder={t(
                            "family.importantContacts.notesPlaceholder",
                          )}
                          className="min-h-[80px]"
                          disabled={isReadOnly || previewMode} data-testid="guardianplaybook-textarea"
                        />
                      </div>
                    </div>
                    {!isReadOnly && !previewMode && (
                      <Button
                        onClick={() => removeContact(index)}
                        variant="ghost"
                        size="sm"
                        className="mt-2" data-testid="guardianplaybook-button"
                      >
                        <Trash2 className="h-4 w-4 mr-2" data-testid="guardianplaybook-trash2" />
                        {t("family.importantContacts.remove")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {playbook.important_contacts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {t("family.importantContacts.empty")}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="space-y-4" data-testid="guardianplaybook-tabscontent">
        <div>
          <Label htmlFor="document_locations" data-testid="guardianplaybook-t-family-documentlocations-label">
            {t("family.documentLocations.label")}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t("family.documentLocations.description")}
          </p>
          <Textarea
            id="document_locations"
            value={playbook.document_locations}
            onChange={(e) => updateField("document_locations", e.target.value)}
            placeholder={t("family.documentLocations.placeholder")}
            className="min-h-[200px]"
            disabled={isReadOnly || previewMode} data-testid="guardianplaybook-textarea"
          />
        </div>
      </TabsContent>

      <TabsContent value="messages" className="space-y-4" data-testid="guardianplaybook-tabscontent">
        <div>
          <Label htmlFor="personal_messages" data-testid="guardianplaybook-t-family-personalmessages-label">
            {t("family.personalMessages.label")}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t("family.personalMessages.description")}
          </p>
          <Textarea
            id="personal_messages"
            value={playbook.personal_messages}
            onChange={(e) => updateField("personal_messages", e.target.value)}
            placeholder={t("family.personalMessages.placeholder")}
            className="min-h-[200px]"
            disabled={isReadOnly || previewMode} data-testid="guardianplaybook-textarea"
          />
        </div>
      </TabsContent>

      <TabsContent value="instructions" className="space-y-4" data-testid="guardianplaybook-tabscontent">
        <div>
          <Label htmlFor="practical_instructions" data-testid="guardianplaybook-t-family-practicalinstructions-label">
            {t("family.practicalInstructions.label")}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t("family.practicalInstructions.description")}
          </p>
          <Textarea
            id="practical_instructions"
            value={playbook.practical_instructions}
            onChange={(e) =>
              updateField("practical_instructions", e.target.value)
            }
            placeholder={t("family.practicalInstructions.placeholder")}
            className="min-h-[200px]"
            disabled={isReadOnly || previewMode} data-testid="guardianplaybook-textarea"
          />
        </div>
      </TabsContent>
    </Tabs>
  );

  const status = getPlaybookStatus();
  const statusColors = {
    empty: "secondary",
    draft: "warning",
    complete: "success",
  } as const;

  return (
    <>
      <Card className="w-full" data-testid="guardianplaybook-card">
        <CardHeader data-testid="guardianplaybook-cardheader">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="guardianplaybook-cardtitle">
                {isReadOnly
                  ? t("playbook.titleReadOnly", { name: guardianName })
                  : t("playbook.title", { name: guardianName })}
              </CardTitle>
              <CardDescription data-testid="guardianplaybook-t-ui-common-family-description">
                {t("ui-common:family.description")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[status]} data-testid="guardianplaybook-t-family-status-status">
                {t("family.status.${status}")}
              </Badge>
              {!isReadOnly && (
                <>
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    variant="outline"
                    size="sm" data-testid="guardianplaybook-previewmode"
                  >
                    {previewMode ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" data-testid="guardianplaybook-eyeoff" />
                        {t("family.exitPreview")}
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" data-testid="guardianplaybook-eye" />
                        {t("ui-common:family.preview")}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={savePlaybook}
                    disabled={saving || !hasChanges || previewMode}
                    size="sm" data-testid="guardianplaybook-button"
                  >
                    <Save className="h-4 w-4 mr-2" data-testid="guardianplaybook-save" />
                    {saving
                      ? t("ui-common:family.saving")
                      : t("ui-common:family.save")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent data-testid="guardianplaybook-rendercontent">{renderContent()}</CardContent>
      </Card>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog} data-testid="guardianplaybook-alertdialog">
        <AlertDialogContent data-testid="guardianplaybook-alertdialogcontent">
          <AlertDialogHeader data-testid="guardianplaybook-alertdialogheader">
            <AlertDialogTitle data-testid="guardianplaybook-t-family-discardchanges-title">
              {t("family.discardChanges.title")}
            </AlertDialogTitle>
            <AlertDialogDescription data-testid="guardianplaybook-t-family-discardchanges-description">
              {t("family.discardChanges.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-testid="guardianplaybook-alertdialogfooter">
            <AlertDialogCancel data-testid="guardianplaybook-t-family-discardchanges-cancel">
              {t("family.discardChanges.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasChanges(false);
                fetchPlaybook();
              }} data-testid="guardianplaybook-t-family-discardchanges-confirm"
            >
              {t("family.discardChanges.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
