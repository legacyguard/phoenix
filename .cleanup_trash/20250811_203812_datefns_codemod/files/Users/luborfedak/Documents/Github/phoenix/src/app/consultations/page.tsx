"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LegalConsultationService,
  ConsultationRequest,
} from "@/services/LegalConsultationService";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  CreditCard,
  XCircle,
  Calendar,
  Building,
  FileText,
} from "lucide-react";

export default function MyConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationRequest | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);

  const fetchConsultations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await LegalConsultationService.getUserConsultations(user.id);
      setConsultations(data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConsultations();
    }
  }, [user, fetchConsultations]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: {
        label: "Pending Payment",
        variant: "secondary" as const,
        icon: CreditCard,
      },
      payment_failed: {
        label: "Payment Failed",
        variant: "destructive" as const,
        icon: XCircle,
      },
      submitted_to_firm: {
        label: "Awaiting Response",
        variant: "default" as const,
        icon: Clock,
      },
      answered: {
        label: "Answered",
        variant: "default" as const,
        icon: CheckCircle2,
      },
      cancelled: {
        label: "Cancelled",
        variant: "secondary" as const,
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary" as const,
      icon: AlertCircle,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getConsultationTypeIcon = (type: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      will_review: FileText,
      estate_planning: Building,
      inheritance_dispute: AlertCircle,
      tax_consultation: CreditCard,
      general_advice: MessageCircle,
    };

    const Icon = iconMap[type] || MessageCircle;
    return <Icon className="h-4 w-4" />;
  };

  const formatConsultationType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const viewResponse = (consultation: ConsultationRequest) => {
    setSelectedConsultation(consultation);
    setShowResponseDialog(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Legal Consultations</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Legal Consultations</h1>
        <p className="text-muted-foreground">
          Track and manage your legal consultation requests
        </p>
      </div>

      {consultations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No consultations yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't submitted any legal consultation requests.
            </p>
            <Button>Request a Consultation</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card
              key={consultation.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getConsultationTypeIcon(consultation.consultation_type)}
                    <div>
                      <h3 className="font-semibold">
                        {formatConsultationType(consultation.consultation_type)}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(consultation.created_at),
                            "MMM d, yyyy",
                          )}
                        </span>
                        {consultation.assigned_firm && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {consultation.assigned_firm.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(consultation.status)}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Your Question:</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {consultation.user_question}
                  </p>
                </div>

                {consultation.status === "answered" &&
                  consultation.law_firm_response && (
                    <div className="pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => viewResponse(consultation)}
                        className="w-full sm:w-auto"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View Response
                      </Button>
                    </div>
                  )}

                {consultation.status === "pending_payment" && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-amber-600 dark:text-amber-500 mb-2">
                      Payment required to submit your consultation
                    </p>
                    <Button size="sm" className="w-full sm:w-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment (€{consultation.payment_amount})
                    </Button>
                  </div>
                )}

                {consultation.status === "payment_failed" && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-destructive mb-2">
                      Payment failed. Please try again.
                    </p>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Retry Payment (€{consultation.payment_amount})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Law Firm Response</DialogTitle>
            <DialogDescription>
              {selectedConsultation && (
                <span>
                  {formatConsultationType(
                    selectedConsultation.consultation_type,
                  )}{" "}
                  • Responded on{" "}
                  {format(
                    new Date(selectedConsultation.responded_at!),
                    "MMMM d, yyyy",
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedConsultation && (
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Your Question:</h4>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                  {selectedConsultation.user_question}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Law Firm Response:</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">
                    {selectedConsultation.law_firm_response}
                  </p>
                </div>
              </div>

              {selectedConsultation.assigned_firm && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Response provided by:{" "}
                    <span className="font-medium">
                      {selectedConsultation.assigned_firm.name}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
