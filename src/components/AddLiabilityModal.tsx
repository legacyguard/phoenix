import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { supabaseWithRetry } from "@/utils/supabaseWithRetry";
import { toast } from "sonner";

interface AddLiabilityModalProps {
  assetId: string;
  onClose: () => void;
  onLiabilityAdded: () => void;
}

export const AddLiabilityModal: React.FC<AddLiabilityModalProps> = ({
  assetId,
  onClose,
  onLiabilityAdded,
}) => {
  const { t } = useTranslation("assets");
  const [formData, setFormData] = useState({
    liability_type: "",
    provider_name: "",
    reference_number: "",
    payment_frequency: t("common:addLiabilityModal.frequencies.monthly"),
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const LIABILITY_TYPES = [
    "insurancePolicy",
    "utilityBill",
    "propertyTax",
    "subscriptionFee",
    "maintenanceContract",
    "loan",
    "leaseAgreement",
    "warranty",
    "other",
  ];

  const PAYMENT_FREQUENCIES = [
    "monthly",
    "quarterly",
    "semiAnnually",
    "annually",
    "oneTime",
    "asNeeded",
  ];

  const handleAddLiability = async () => {
    if (!formData.liability_type || !formData.provider_name) {
      toast.error(t("common:addLiabilityModal.errors.requiredFields"));
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t("errors:errors.notAuthenticated"));
        return;
      }

      const { error } = await supabaseWithRetry
        .from("asset_liabilities")
        .insert([
          {
            asset_id: assetId,
            user_id: user.id,
            ...formData,
          },
        ]);

      if (error) throw error;

      toast.success(t("common:addLiabilityModal.messages.addedSuccessfully"));
      onLiabilityAdded();
      onClose();
    } catch (error: Record<string, unknown>) {
      toast.error(t("errors:errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addLiabilityModal.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("addLiabilityModal.fields.type")}</Label>
            <Select
              value={formData.liability_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, liability_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("addLiabilityModal.placeholders.selectType")}
                />
              </SelectTrigger>
              <SelectContent>
                {LIABILITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`addLiabilityModal.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("addLiabilityModal.fields.provider")}</Label>
            <Input
              placeholder={t("addLiabilityModal.placeholders.provider")}
              value={formData.provider_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  provider_name: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("addLiabilityModal.fields.referenceNumber")}</Label>
            <Input
              placeholder={t("addLiabilityModal.placeholders.referenceNumber")}
              value={formData.reference_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reference_number: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("addLiabilityModal.fields.paymentFrequency")}</Label>
            <Select
              value={formData.payment_frequency}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, payment_frequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "addLiabilityModal.placeholders.paymentFrequency",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {t(`addLiabilityModal.frequencies.${frequency}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("addLiabilityModal.fields.notes")}</Label>
            <Textarea
              placeholder={t("addLiabilityModal.placeholders.notes")}
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {t("addLiabilityModal.buttons.cancel")}
            </Button>
            <Button
              className="ml-2"
              onClick={handleAddLiability}
              disabled={isLoading}
            >
              {t("addLiabilityModal.buttons.add")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
