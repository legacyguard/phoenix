import React from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorTest } from "@/components/test/ErrorTest";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function TestError() {
  const { t } = useTranslation("errors");
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              {t("test.environment.title")}
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t("test.environment.description")}
            </p>
          </div>
        </div>
      </Card>

      <ErrorBoundary>
        <ErrorTest />
      </ErrorBoundary>
    </div>
  );
}
