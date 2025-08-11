import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { stripeService } from "@/services/stripeService";

export const PricingSection: React.FC = () => {
  const { t } = useTranslation("ui-common");

  const plans = [
    {
      id: "starter",
      name: t("landing.starter.name"),
      price: t("landing.starter.price"),
      period: "",
      description: t("landing.starter.description"),
      features: [
        t("pricing.starter.features.storage", {
          amount: t("landing.starter.limits.storage"),
        }),
        t("pricing.starter.features.guardians", {
          count: t("landing.starter.limits.guardians"),
        }),
        t("landing.starter.features.documents"),
        t("landing.starter.features.playbook"),
        t("landing.starter.features.support"),
      ],

      buttonText: t("landing.starter.button"),
      buttonLink: "/register",
      highlighted: false,
    },
    {
      id: "premium",
      name: t("landing.premium.name"),
      price: t("landing.premium.price"),
      period: t("landing.premium.period"),
      description: t("landing.premium.description"),
      features: [
        t("pricing.premium.features.storage", {
          amount: t("landing.premium.limits.storage"),
        }),
        t("pricing.premium.features.guardians", {
          count: t("landing.premium.limits.guardians"),
        }),
        t("landing.premium.features.manual"),
        t("landing.premium.features.support"),
      ],

      buttonText: t("landing.premium.button"),
      buttonLink: "/register",
      highlighted: true,
      badge: t("landing.premium.badge"),
    },
    {
      id: "enterprise",
      name: t("landing.enterprise.name"),
      price: t("landing.enterprise.price"),
      period: "",
      description: t("landing.enterprise.description"),
      features: [
        t("pricing.enterprise.features.storage", {
          amount: t("landing.enterprise.limits.storage"),
        }),
        t("landing.enterprise.features.guardians"),
        t("landing.enterprise.features.legal"),
        t("landing.enterprise.features.support"),
      ],

      buttonText: t("landing.enterprise.button"),
      buttonLink: "mailto:sales@legacyguard.com",
      highlighted: false,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {t("landing.mainTitle")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("landing.mainSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-lg text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 px-6 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col items-stretch px-6 pb-6 gap-2">
                {plan.id === "enterprise" ? (
                  <a href={plan.buttonLink} className="w-full">
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      {plan.buttonText}
                    </Button>
                  </a>
                ) : (
                  <>
                    <Link to={plan.buttonLink} className="w-full">
                      <Button
                        variant={plan.highlighted ? "default" : "outline"}
                        size="lg"
                        className="w-full"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                    {plan.id === "premium" && (
                      <Button
                        onClick={() =>
                          stripeService.createCheckoutSession(
                            plan.id,
                            "user-id",
                          )
                        }
                        variant={plan.highlighted ? "default" : "outline"}
                        size="lg"
                        className="w-full"
                      >
                        {t("landing.pricingSection.upgrade_with_stripe_1")}
                      </Button>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
