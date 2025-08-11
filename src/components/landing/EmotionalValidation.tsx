import React from "react";
import { useTranslation } from "react-i18next";
import type { Heart, Shield, Moon } from "lucide-react";

export const EmotionalValidation: React.FC = () => {
  const { t } = useTranslation("landing");

  const validationPoints = [
    {
      icon: Heart,
      key: "love",
      color: "text-warm-primary bg-warm-primary/10",
    },
    {
      icon: Shield,
      key: "protection",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Moon,
      key: "peace",
      color: "text-earth-primary bg-earth-primary/10",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t("emotionalValidation.title")}
          </h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("emotionalValidation.description")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {validationPoints.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className={`p-4 rounded-full ${color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <span className="text-foreground font-medium text-center">
                  {t(`emotionalValidation.points.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
