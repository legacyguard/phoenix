import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface EmpatheticButtonProps extends ButtonProps {
  action:
    | "save"
    | "delete"
    | "share"
    | "edit"
    | "add"
    | "continue"
    | "back"
    | "next";
  loading?: boolean;
  loadingContext?: string;
}

const EmpatheticButton: React.FC<EmpatheticButtonProps> = ({
  action,
  loading = false,
  loadingContext,
  children,
  className,
  disabled,
  ...props
}) => {
  const { t } = useTranslation("loading-states");
  const [isHovered, setIsHovered] = useState(false);

  const getButtonText = () => {
    if (loading && loadingContext) {
      return loadingContext;
    }
    return isHovered ? t(`microInteractions.buttons.${action}`) : children;
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        className={cn("transition-all duration-300", className)}
        disabled={disabled || loading}
        {...props}
      >
        <motion.span
          key={isHovered ? "hover" : "normal"}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {getButtonText()}
        </motion.span>
      </Button>
    </motion.div>
  );
};

export default EmpatheticButton;
