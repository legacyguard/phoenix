import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmpatheticTransitionProps {
  from: string;
  to: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

const transitionKeys: Record<string, string> = {
  "dashboard-assets": "dashboard_to_assets",
  "assets-family": "assets_to_family",
  "family-will": "family_to_will",
  "will-review": "will_to_review",
};

const EmpatheticTransition: React.FC<EmpatheticTransitionProps> = ({
  from,
  to,
  duration = 2000,
  onComplete,
  className,
}) => {
  const { t } = useTranslation("loading-states");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Wait for fade out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const transitionKey = `${from}-${to}`;
  const message = t(
    `transitions.${transitionKeys[transitionKey] || "navigating"}`,
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm",
            className,
          )}
        >
          <div className="flex flex-col items-center space-y-6">
            {/* Animated icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-16 h-16 text-primary" />
            </motion.div>

            {/* Transition message */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <p className="text-lg font-medium text-gray-900">{message}</p>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center justify-center text-primary"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmpatheticTransition;
