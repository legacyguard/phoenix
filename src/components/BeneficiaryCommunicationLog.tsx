import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  FileText,
  Plus,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import format from "date-fns/format";

interface Communication {
  id: string;
  beneficiary_name: string;
  beneficiary_email?: string;
  communication_type: "email" | "phone" | "letter" | "in_person" | "other";
  subject: string;
  summary: string;
  communication_date: string;
  created_at: string;
}

interface BeneficiaryCommunicationLogProps {
  deceasedUserId: string;
}

export const BeneficiaryCommunicationLog: React.FC<
  BeneficiaryCommunicationLogProps
> = ({ deceasedUserId }) => {
  const { user } = useAuth();
  const { t } = useTranslation("family-core");
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    beneficiary_name: "",
    beneficiary_email: "",
    communication_type: "email" as Communication["communication_type"],
    subject: "",
    summary: "",
    communication_date: new Date().toISOString().split("T")[0],
  });

  const fetchCommunications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("beneficiary_communications")
        .select("*")
        .eq("executor_id", user?.id)
        .eq("deceased_user_id", deceasedUserId)
        .order("communication_date", { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (err) {
      console.error("Failed to fetch communications:", err);
    }
  }, [user?.id, deceasedUserId]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("beneficiary_communications")
        .insert({
          executor_id: user?.id,
          deceased_user_id: deceasedUserId,
          ...formData,
          communication_date: new Date(
            formData.communication_date,
          ).toISOString(),
        });

      if (error) throw error;

      // Log this action
      await supabase.from("access_logs").insert({
        user_id: user?.id,
        actor: "USER",
        action: t("beneficiaryCommunications.logAction", {
          name: formData.beneficiary_name,
        }),
        metadata: { communication_type: formData.communication_type },
      });

      await fetchCommunications();
      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to log communication:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      beneficiary_name: "",
      beneficiary_email: "",
      communication_type: "email",
      subject: "",
      summary: "",
      communication_date: new Date().toISOString().split("T")[0],
    });
  };

  const getTypeIcon = (type: Communication["communication_type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "letter":
        return <FileText className="h-4 w-4" />;
      case "in_person":
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: Communication["communication_type"]) => {
    switch (type) {
      case "email":
        return "default";
      case "phone":
        return "secondary";
      case "letter":
        return "outline";
      case "in_person":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t("beneficiaryCommunications.title")}
            </CardTitle>
            <CardDescription>
              {t("beneficiaryCommunications.description")}
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t("beneficiaryCommunications.logCommunication")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {t("beneficiaryCommunications.dialog.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("beneficiaryCommunications.dialog.description")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_name">
                      {t("beneficiaryCommunications.fields.beneficiaryName")}*
                    </Label>
                    <Input
                      id="beneficiary_name"
                      value={formData.beneficiary_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          beneficiary_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_email">
                      {t("beneficiaryCommunications.fields.email")}
                    </Label>
                    <Input
                      id="beneficiary_email"
                      type="email"
                      value={formData.beneficiary_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          beneficiary_email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="communication_type">
                      {t("beneficiaryCommunications.fields.type")}*
                    </Label>
                    <Select
                      value={formData.communication_type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          communication_type:
                            value as Communication["communication_type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          {t("beneficiaryCommunications.types.email")}
                        </SelectItem>
                        <SelectItem value="phone">
                          {t("beneficiaryCommunications.types.phone")}
                        </SelectItem>
                        <SelectItem value="letter">
                          {t("beneficiaryCommunications.types.letter")}
                        </SelectItem>
                        <SelectItem value="in_person">
                          {t("beneficiaryCommunications.types.inPerson")}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("beneficiaryCommunications.types.other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communication_date">
                      {t("beneficiaryCommunications.fields.date")}*
                    </Label>
                    <Input
                      id="communication_date"
                      type="date"
                      value={formData.communication_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          communication_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    {t("beneficiaryCommunications.fields.subject")}*
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder={t(
                      "beneficiaryCommunications.placeholders.subject",
                    )}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">
                    {t("beneficiaryCommunications.fields.summary")}*
                  </Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    placeholder={t(
                      "beneficiaryCommunications.placeholders.summary",
                    )}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("beneficiaryCommunications.actions.cancel")}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? t("beneficiaryCommunications.actions.saving")
                      : t("beneficiaryCommunications.actions.save")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>{t("beneficiaryCommunications.empty.title")}</p>
              <p className="text-sm mt-1">
                {t("beneficiaryCommunications.empty.subtitle")}
              </p>
            </div>
          ) : (
            communications.map((comm) => (
              <div key={comm.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getTypeBadgeVariant(comm.communication_type)}
                    >
                      <span className="flex items-center gap-1">
                        {getTypeIcon(comm.communication_type)}
                        {t(
                          `beneficiaryCommunications.types.${comm.communication_type}`,
                        )}
                      </span>
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(comm.communication_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-medium">{comm.beneficiary_name}</p>
                  {comm.beneficiary_email && (
                    <p className="text-sm text-muted-foreground">
                      {comm.beneficiary_email}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-medium text-sm">{comm.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {comm.summary}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
