import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmpatheticValidationProps {
  type?:
    | "required"
    | "invalid_format"
    | "too_short"
    | "too_long"
    | "success"
    | "checking";
  message?: string;
  show?: boolean;
  className?: string;
}

const EmpatheticValidation: React.FC<EmpatheticValidationProps> = ({
  type = "required",
  message,
  show = true,
  className,
}) => {
  const { t } = useTranslation("loading-states");

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "checking":
        return <Info className="w-4 h-4 text-blue-600 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-700";
      case "checking":
        return "text-blue-700";
      default:
        return "text-amber-700";
    }
  };

  const validationMessage =
    message || t(`microInteractions.validation.${type}`);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("overflow-hidden", className)}
        >
          <div
            className={cn(
              "flex items-center space-x-2 mt-1 text-sm",
              getTextColor(),
            )}
          >
            {getIcon()}
            <span>{validationMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmpatheticValidation;
