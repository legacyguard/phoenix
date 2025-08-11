import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Globe } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';import type { useTranslation } from "react-i18next";

interface RedirectSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDomain: string;
}

export const RedirectSimulationModal: React.FC<RedirectSimulationModalProps> = ({
  isOpen,
  onClose,
  targetDomain
}) => {
  const fullUrl = `https://${targetDomain}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />{t("modals.redirectSimulationModal.redirect_simulation_1")}

          </DialogTitle>
          <DialogDescription>{t("modals.redirectSimulationModal.development_staging_environmen_2")}

          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{t("modals.redirectSimulationModal.v_produkci_by_jste_byli_p_esm__3")}

            </AlertDescription>
          </Alert>

          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm font-mono break-all">
              {fullUrl}
            </code>
          </div>

          <div className="text-sm text-muted-foreground">{t("modals.redirectSimulationModal.this_redirect_simulation_is_sh_4")}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">{t("modals.redirectSimulationModal.vite_is_production_false_5")}</code>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};