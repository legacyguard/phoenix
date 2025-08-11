import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

interface LogLifeEventProps {
  open: boolean;
  onClose: () => void;
  onEventLogged: (event: string) => void;
}

const LogLifeEvent: React.FC<LogLifeEventProps> = ({
  open,
  onClose,
  onEventLogged,
}) => {
  const { t } = useTranslation("ui-common");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const lifeEvents = [
    {
      id: "married_divorced",
      label: t("logLifeEvent.eventTypes.married_divorced"),
    },
    { id: "new_child", label: t("logLifeEvent.eventTypes.new_child") },
    {
      id: "bought_sold_home",
      label: t("logLifeEvent.eventTypes.bought_sold_home"),
    },
    {
      id: "started_business",
      label: t("logLifeEvent.eventTypes.started_business"),
    },
    {
      id: "trusted_person_passed",
      label: t("logLifeEvent.eventTypes.trusted_person_passed"),
    },
    { id: "job_change", label: t("logLifeEvent.eventTypes.job_change") },
    {
      id: "moved_location",
      label: t("logLifeEvent.eventTypes.moved_location"),
    },
    { id: "inheritance", label: t("logLifeEvent.eventTypes.inheritance") },
    { id: "retirement", label: t("logLifeEvent.eventTypes.retirement") },
    { id: "health_change", label: t("logLifeEvent.eventTypes.health_change") },
    {
      id: "child_graduated",
      label: t("logLifeEvent.eventTypes.child_graduated"),
    },
    {
      id: "career_advancement",
      label: t("logLifeEvent.eventTypes.career_advancement"),
    },
    {
      id: "financial_windfall",
      label: t("logLifeEvent.eventTypes.financial_windfall"),
    },
    { id: "debt_change", label: t("logLifeEvent.eventTypes.debt_change") },
    {
      id: "insurance_change",
      label: t("logLifeEvent.eventTypes.insurance_change"),
    },
  ];

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleSubmit = () => {
    if (!selectedEvent) return;

    // Generate checklist and pass to parent
    onEventLogged(selectedEvent);
    setSelectedEvent(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedEvent(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("logLifeEvent.form.title")}</DialogTitle>
          <DialogDescription>
            {t("logLifeEvent.form.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {t("logLifeEvent.form.eventSelection")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("logLifeEvent.form.eventDescription")}
            </p>
          </div>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {lifeEvents.map((event) => (
              <li
                key={event.id}
                className="cursor-pointer"
                onClick={() => handleEventSelect(event.id)}
              >
                <div
                  className={`p-4 rounded-lg border-2 transition-all duration-150 ease-in-out
                  ${
                    selectedEvent === event.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-accent border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.label}</span>
                    {selectedEvent === event.id && (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            {t("logLifeEvent.form.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedEvent}>
            {t("logLifeEvent.form.generateChecklist")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogLifeEvent;
