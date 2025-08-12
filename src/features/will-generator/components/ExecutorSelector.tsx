import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Briefcase, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Executor } from "@/types/will";

interface ExecutorSelectorProps {
  executor?: Executor;
  onUpdate: (executor: Executor) => void;
  errors: Record<string, string>;
}

export function ExecutorSelector({
  executor,
  onUpdate,
  errors,
}: ExecutorSelectorProps) {
  const { t } = useTranslation("wills");
  const [hasAlternative, setHasAlternative] = useState(
    !!executor?.alternativeExecutor,
  );

  const handleExecutorUpdate = (updates: Partial<Executor>) => {
    onUpdate({
      name: executor?.name || "",
      relationship: executor?.relationship || "",
      address: executor?.address || "",
      phone: executor?.phone,
      alternativeExecutor: executor?.alternativeExecutor,
      ...updates,
    });
  };

  const handleAlternativeUpdate = (
    updates: Partial<Executor["alternativeExecutor"]>,
  ) => {
    handleExecutorUpdate({
      alternativeExecutor: {
        name: executor?.alternativeExecutor?.name || "",
        relationship: executor?.alternativeExecutor?.relationship || "",
        address: executor?.alternativeExecutor?.address || "",
        phone: executor?.alternativeExecutor?.phone,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card data-testid="executorselector-card">
        <CardHeader data-testid="executorselector-cardheader">
          <CardTitle className="flex items-center gap-2" data-testid="executorselector-t-wills-wills-executor-title">
            <Briefcase className="h-5 w-5" data-testid="executorselector-briefcase" />
            {t("wills:wills.executor.title")}
          </CardTitle>
          <CardDescription data-testid="executorselector-t-wills-wills-executor-description">
            {t("wills:wills.executor.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" data-testid="executorselector-primary-executor">
          {/* Primary Executor */}
          <div className="space-y-4">
            <h4 className="font-medium">{t("wills:wills.executor.primary")}</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="executor-name" data-testid="executorselector-t-wills-wills-executor-name">
                  {t("wills:wills.executor.name")} *
                </Label>
                <Input
                  id="executor-name"
                  value={executor?.name || ""}
                  onChange={(e) =>
                    handleExecutorUpdate({ name: e.target.value })
                  }
                  placeholder={t("wills.executor.namePlaceholder")} data-testid="executorselector-input"
                />
                {errors.executor && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" data-testid="executorselector-alertcircle" />
                    {errors.executor}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor-relationship" data-testid="executorselector-t-wills-wills-executor-relationship">
                  {t("wills:wills.executor.relationship")} *
                </Label>
                <Input
                  id="executor-relationship"
                  value={executor?.relationship || ""}
                  onChange={(e) =>
                    handleExecutorUpdate({ relationship: e.target.value })
                  }
                  placeholder={t("wills.executor.relationshipPlaceholder")} data-testid="executorselector-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="executor-address" data-testid="executorselector-t-wills-wills-executor-address">
                {t("wills:wills.executor.address")} *
              </Label>
              <Textarea
                id="executor-address"
                value={executor?.address || ""}
                onChange={(e) =>
                  handleExecutorUpdate({ address: e.target.value })
                }
                placeholder={t("wills.executor.addressPlaceholder")}
                rows={3} data-testid="executorselector-textarea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="executor-phone" data-testid="executorselector-t-wills-wills-executor-phone">
                {t("wills:wills.executor.phone")}
              </Label>
              <Input
                id="executor-phone"
                type="tel"
                value={executor?.phone || ""}
                onChange={(e) =>
                  handleExecutorUpdate({ phone: e.target.value })
                }
                placeholder={t("wills.executor.phonePlaceholder")} data-testid="executorselector-input"
              />
            </div>
          </div>

          {/* Alternative Executor Toggle */}
          <div className="flex items-center justify-between py-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="has-alternative" data-testid="executorselector-t-wills-executor-addalternative">
                {t("wills.executor.addAlternative")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("wills.executor.alternativeDescription")}
              </p>
            </div>
            <Switch
              id="has-alternative"
              checked={hasAlternative}
              onCheckedChange={(checked) => {
                setHasAlternative(checked);
                if (!checked) {
                  handleExecutorUpdate({ alternativeExecutor: undefined });
                }
              }} data-testid="executorselector-switch"
            />
          </div>

          {/* Alternative Executor */}
          {hasAlternative && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" data-testid="executorselector-userplus" />
                {t("wills:wills.executor.alternative")}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alt-executor-name" data-testid="executorselector-t-wills-wills-executor-name">
                    {t("wills:wills.executor.name")}
                  </Label>
                  <Input
                    id="alt-executor-name"
                    value={executor?.alternativeExecutor?.name || ""}
                    onChange={(e) =>
                      handleAlternativeUpdate({ name: e.target.value })
                    }
                    placeholder={t("wills.executor.namePlaceholder")} data-testid="executorselector-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt-executor-relationship" data-testid="executorselector-t-wills-wills-executor-relationship">
                    {t("wills:wills.executor.relationship")}
                  </Label>
                  <Input
                    id="alt-executor-relationship"
                    value={executor?.alternativeExecutor?.relationship || ""}
                    onChange={(e) =>
                      handleAlternativeUpdate({ relationship: e.target.value })
                    }
                    placeholder={t("wills.executor.relationshipPlaceholder")} data-testid="executorselector-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt-executor-address" data-testid="executorselector-t-wills-wills-executor-address">
                  {t("wills:wills.executor.address")}
                </Label>
                <Textarea
                  id="alt-executor-address"
                  value={executor?.alternativeExecutor?.address || ""}
                  onChange={(e) =>
                    handleAlternativeUpdate({ address: e.target.value })
                  }
                  placeholder={t("wills.executor.addressPlaceholder")}
                  rows={3} data-testid="executorselector-textarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt-executor-phone" data-testid="executorselector-t-wills-wills-executor-phone">
                  {t("wills:wills.executor.phone")}
                </Label>
                <Input
                  id="alt-executor-phone"
                  type="tel"
                  value={executor?.alternativeExecutor?.phone || ""}
                  onChange={(e) =>
                    handleAlternativeUpdate({ phone: e.target.value })
                  }
                  placeholder={t("wills.executor.phonePlaceholder")} data-testid="executorselector-input"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Executor responsibilities */}
      <Card data-testid="executorselector-card">
        <CardContent className="pt-6" data-testid="executorselector-cardcontent">
          <h4 className="font-medium mb-2">
            {t("wills:wills.executor.responsibilities")}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t("wills:wills.executor.responsibility1")}</li>
            <li>• {t("wills:wills.executor.responsibility2")}</li>
            <li>• {t("wills:wills.executor.responsibility3")}</li>
            <li>• {t("wills:wills.executor.responsibility4")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
