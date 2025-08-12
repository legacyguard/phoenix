import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Calendar,
  Users,
  MessageSquare,
  Image,
  Video,
  Mic,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import type { TimeCapsuleMessage } from "@/types/timeCapsule";
import { CreateTimeCapsuleModal } from "@/components/CreateTimeCapsuleModal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

export const LegacyLetters: React.FC = () => {
  const { t } = useTranslation("time-capsule");
  const { t: tMicro } = useTranslation("micro-copy");
  const { user } = useUser();
  const [capsules, setCapsules] = useState<TimeCapsuleMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCapsule, setSelectedCapsule] =
    useState<TimeCapsuleMessage | null>(null);
  const [trustedPeople, setTrustedPeople] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      relationship?: string;
    }>
  >([]);

  // Fetch time capsules
  const fetchCapsules = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/time-capsule", {
        headers: {
          Authorization: `Bearer ${await user?.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch time capsules");
      }

      const { data } = await response.json();
      setCapsules(data || []);
    } catch (err) {
      console.error("Error fetching time capsules:", err);
      setError(t("legacyLetters.failed_to_load_your_time_capsu_1"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  // Fetch trusted people for recipient selection
  const fetchTrustedPeople = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("trusted_people")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (!error && data) {
      setTrustedPeople(data);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCapsules();
      fetchTrustedPeople();
    }
  }, [user, fetchCapsules, fetchTrustedPeople]);

  const handleDelete = async (capsuleId: string) => {
    if (!confirm(t("legacyLetters.are_you_sure_you_want_to_delet_2"))) {
      return;
    }

    try {
      const response = await fetch(`/api/time-capsule/${capsuleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await user?.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("legacyLetters.errors.deleteFailed"));
      }

      toast.success(t("legacyLetters.messages.deleteSuccess"));
      fetchCapsules();
    } catch (err) {
      console.error("Error deleting time capsule:", err);
      toast.error(t("legacyLetters.messages.deleteFailed"));
    }
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case "text":
        return <MessageSquare className="h-5 w-5" data-testid="legacyletters-messagesquare" />;
      case "photo":
        return <Image className="h-5 w-5" data-testid="legacyletters-image" />;
      case "video":
        return <Video className="h-5 w-5" data-testid="legacyletters-video" />;
      case "audio":
        return <Mic className="h-5 w-5" data-testid="legacyletters-mic" />;
      default:
        return <MessageSquare className="h-5 w-5" data-testid="legacyletters-messagesquare" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "locked":
        return (
          <Badge variant="secondary" className="gap-1" data-testid="legacyletters-tmicro-badges-status-locked">
            <Lock className="h-3 w-3" data-testid="legacyletters-lock" />
            {tMicro("badges.status.locked")}
          </Badge>
        );

      case "unlocked":
        return (
          <Badge variant="default" className="gap-1" data-testid="legacyletters-tmicro-badges-status-unlocked">
            <Unlock className="h-3 w-3" data-testid="legacyletters-unlock" />
            {tMicro("badges.status.unlocked")}
          </Badge>
        );

      case "delivered":
        return (
          <Badge variant="outline" className="gap-1" data-testid="legacyletters-tmicro-badges-status-delivered">
            <Users className="h-3 w-3" data-testid="legacyletters-users" />
            {tMicro("badges.status.delivered")}
          </Badge>
        );

      default:
        return null;
    }
  };

  const getRecipientNames = (recipientIds: string[]) => {
    const recipients = trustedPeople.filter((person) =>
      recipientIds.includes(person.id),
    );
    if (recipients.length === 0) return tMicro("statusMessages.empty.noFamily");
    if (recipients.length <= 2) return recipients.map((r) => r.name).join(", ");
    return `${recipients[0].name} and ${recipients.length - 1} others`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" data-testid="legacyletters-skeleton" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" data-testid="legacyletters-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("legacyLetters.legacy_letters_3")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("legacyLetters.create_and_manage_sealed_messa_4")}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="gap-2" data-testid="legacyletters-button"
        >
          <Plus className="h-5 w-5" data-testid="legacyletters-plus" />
          {t("legacyLetters.create_new_message_5")}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" data-testid="legacyletters-alert">
          <AlertCircle className="h-4 w-4" data-testid="legacyletters-alertcircle" />
          <AlertDescription data-testid="legacyletters-error">{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && capsules.length === 0 && (
        <Card className="p-12 text-center" data-testid="legacyletters-card">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" data-testid="legacyletters-clock" />
          <h3 className="text-lg font-semibold mb-2">
            {t("legacyLetters.no_time_capsules_yet_6")}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t("legacyLetters.create_meaningful_messages_for_7")}
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="gap-2" data-testid="legacyletters-button"
          >
            <Plus className="h-5 w-5" data-testid="legacyletters-plus" />
            {t("legacyLetters.create_your_first_message_8")}
          </Button>
        </Card>
      )}

      {/* Time Capsules Grid */}
      {capsules.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capsules.map((capsule) => (
            <Card
              key={capsule.id}
              className="hover:shadow-lg transition-shadow" data-testid="legacyletters-card"
            >
              <CardHeader data-testid="legacyletters-cardheader">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="line-clamp-1" data-testid="legacyletters-capsule-title">
                      {capsule.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2" data-testid="legacyletters-getmessageicon-capsule-messagetype">
                      {getMessageIcon(capsule.messageType)}
                      <span className="capitalize">
                        {capsule.messageType} message
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(capsule.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4" data-testid="legacyletters-recipients">
                {/* Recipients */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" data-testid="legacyletters-users" />
                  <span className="text-muted-foreground">
                    {t("legacyLetters.to_9")}
                  </span>
                  <span className="font-medium">
                    {getRecipientNames(capsule.recipientIds)}
                  </span>
                </div>

                {/* Unlock Condition */}
                <div className="flex items-center gap-2 text-sm">
                  {capsule.unlockCondition === "date" ? (
                    <>
                      <Calendar className="h-4 w-4 text-muted-foreground" data-testid="legacyletters-calendar" />
                      <span className="text-muted-foreground">
                        {t("legacyLetters.unlocks_on_10")}
                      </span>
                      <span className="font-medium">
                        {capsule.unlockDate
                          ? format(new Date(capsule.unlockDate), "PPP")
                          : "Date not set"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground" data-testid="legacyletters-clock" />
                      <span className="text-muted-foreground">
                        {t("legacyLetters.unlocks_11")}
                      </span>
                      <span className="font-medium">
                        {t("legacyLetters.after_passing_12")}
                      </span>
                    </>
                  )}
                </div>

                {/* Created Date */}
                <div className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(capsule.createdAt), {
                    addSuffix: true,
                  })}
                </div>

                {/* Actions */}
                {capsule.status === "locked" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedCapsule(capsule);
                        setShowCreateModal(true);
                      }} data-testid="legacyletters-edit"
                    >
                      <Edit className="h-4 w-4 mr-1" data-testid="legacyletters-edit" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(capsule.id)} data-testid="legacyletters-handledelete-capsule-id"
                    >
                      <Trash2 className="h-4 w-4 mr-1" data-testid="legacyletters-trash2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateTimeCapsuleModal
          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCapsule(null);
          }}
          trustedPeople={trustedPeople}
          onSuccess={() => {
            fetchCapsules();
            setShowCreateModal(false);
            setSelectedCapsule(null);
          }}
          editingCapsule={selectedCapsule} data-testid="legacyletters-createtimecapsulemodal"
        />
      )}
    </div>
  );
};
