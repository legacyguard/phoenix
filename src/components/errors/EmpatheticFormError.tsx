import React from "react";
import { Info, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface EmpatheticFormErrorProps {
  field: string;
  error: string;
  className?: string;
  showIcon?: boolean;
}

const EmpatheticFormError: React.FC<EmpatheticFormErrorProps> = ({
  field,
  error,
  className,
  showIcon = true,
}) => {
  const { t } = useTranslation("errors");

  // Get the appropriate error message
  const getErrorMessage = () => {
    // Check if we have a specific validation message
    const validationKey = `validation.${error}`;
    const hasValidationMessage = t(validationKey, { defaultValue: "" }) !== "";

    if (hasValidationMessage) {
      return t(validationKey);
    }

    // Fallback to contextual messages based on field type
    if (field.toLowerCase().includes("email")) {
      return t("validation:validation.invalid_email");
    }
    if (field.toLowerCase().includes("phone")) {
      return t("validation:validation.invalid_phone");
    }
    if (field.toLowerCase().includes("date")) {
      return t("validation:validation.invalid_date");
    }
    if (field.toLowerCase().includes("password")) {
      return t("validation:validation.password_weak");
    }

    // Default message
    return t("validation:validation.required_field");
  };

  return (
    <div className={cn("empathetic-form-error", className)}>
      {showIcon && (
        <div className="error-icon">
          <Info className="h-4 w-4 text-blue-500" />
        </div>
      )}
      <div className="error-message">
        <p className="text-sm text-gray-700">{getErrorMessage()}</p>
        <small className="text-xs text-gray-500 mt-1">
          This helps me make sure your family has the right information.
        </small>
      </div>
    </div>
  );
};

// Export additional variant for inline errors
export const InlineEmpatheticError: React.FC<{ message: string }> = ({
  message,
}) => {
  const { t } = useTranslation("errors");

  return (
    <span className="inline-empathetic-error">
      <AlertCircle className="inline h-3 w-3 mr-1 text-amber-500" />
      <span className="text-sm text-amber-700">{message}</span>
    </span>
  );
};

export default EmpatheticFormError;
