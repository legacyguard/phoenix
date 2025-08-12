import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Clock,
  Euro,
  Heart,
  Users,
  Home as HomeIcon,
  Building,
  Wallet,
  Share2,
  ArrowRight,
} from "lucide-react";

export const FamilyPreparednessCalculator: React.FC = () => {
  const { t } = useTranslation("dashboard-main");
  const [dependents, setDependents] = useState(2);
  const [income, setIncome] = useState(3000);
  const [hasProperty, setHasProperty] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [accounts, setAccounts] = useState(2);
  const [showResults, setShowResults] = useState(false);

  const [timeSaved, setTimeSaved] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [stressReduction] = useState(85);
  const [confidenceIncrease] = useState(92);
  const [controlRating] = useState(9.8);

  useEffect(() => {
    const calculateSavings = () => {
      // Estimate time savings based on complexity
      const baseTime = 40;
      const accountTime = accounts * 5;
      const propertyTime = hasProperty ? 30 : 0;
      const businessTime = hasBusiness ? 40 : 0;
      const dependentTime = dependents * 10;

      const timeWithout =
        baseTime + accountTime + propertyTime + businessTime + dependentTime;
      const timeWith = 0.083; // 5 minutes in hours
      setTimeSaved(Math.round(timeWithout - timeWith));

      // Estimate money savings
      const legalFees =
        2000 + (hasProperty ? 2000 : 0) + (hasBusiness ? 4000 : 0);
      const lostWages = Math.round((income / 160) * timeSaved);
      const penalties =
        1000 + (hasProperty ? 2000 : 0) + (hasBusiness ? 2000 : 0);
      const totalMoneySaved = legalFees + lostWages + penalties;
      setMoneySaved(totalMoneySaved);
    };

    calculateSavings();
  }, [dependents, income, hasProperty, hasBusiness, accounts, timeSaved]);

  const handleCalculate = () => {
    setShowResults(true);
    // Smooth scroll to results
    setTimeout(() => {
      document
        .getElementById("calculator-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    const shareText = t("calculator.shareText", {
      timeSaved: timeSaved.toString(),
      moneySaved: moneySaved.toLocaleString("en-EU"),
    });
    if (navigator.share) {
      navigator.share({
        title: t("dashboard.shareTitle"),
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText);
      alert(t("dashboard.shareCopied"));
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Calculator className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("dashboard-main:dashboard.badge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("dashboard-main:dashboard.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("dashboard-main:dashboard.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Inputs Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("dashboard-main:dashboard.inputs.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard-main:dashboard.inputs.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dependents */}
              <div className="space-y-2">
                <Label htmlFor="dependents" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard-main:dashboard.inputs.dependents")}
                </Label>
                <Input
                  id="dependents"
                  type="number"
                  min="0"
                  max="10"
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value))}
                  className="text-lg"
                />

                <p className="text-sm text-muted-foreground">
                  {t("dashboard.inputs.dependentsHelp")}
                </p>
              </div>

              {/* Income */}
              <div className="space-y-2">
                <Label htmlFor="income" className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard-main:dashboard.inputs.income")}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <Input
                    id="income"
                    type="number"
                    min="0"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="pl-8 text-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.inputs.incomeHelp")}
                </p>
              </div>

              {/* Property */}
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="property"
                  checked={hasProperty}
                  onCheckedChange={(checked) =>
                    setHasProperty(checked as boolean)
                  }
                />

                <Label
                  htmlFor="property"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard-main:dashboard.inputs.property")}
                </Label>
              </div>

              {/* Business */}
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="business"
                  checked={hasBusiness}
                  onCheckedChange={(checked) =>
                    setHasBusiness(checked as boolean)
                  }
                />

                <Label
                  htmlFor="business"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard-main:dashboard.inputs.business")}
                </Label>
              </div>

              {/* Bank Accounts */}
              <div className="space-y-2">
                <Label htmlFor="accounts" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard-main:dashboard.inputs.accounts")}
                </Label>
                <Input
                  id="accounts"
                  type="number"
                  min="0"
                  max="20"
                  value={accounts}
                  onChange={(e) => setAccounts(Number(e.target.value))}
                  className="text-lg"
                />

                <p className="text-sm text-muted-foreground">
                  {t("dashboard.inputs.accountsHelp")}
                </p>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                {t("dashboard.calculateButton")}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card
            id="calculator-results"
            className={`transition-opacity duration-500 ${showResults ? "opacity-100" : "opacity-50"}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t("dashboard-main:dashboard.results.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard-main:dashboard.results.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Savings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">
                    {t("dashboard.results.timeSavings.title")}
                  </h3>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("dashboard.results.timeSavings.without")}
                    </span>
                    <span className="font-medium text-red-600">
                      {t("dashboard.results.timeSavings.withoutHours")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("dashboard.results.timeSavings.with")}
                    </span>
                    <span className="font-medium text-green-600">
                      {t("dashboard.results.timeSavings.withMinutes")}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-primary font-semibold">
                      {t("calculator.results.timeSavings.saved", {
                        hours: timeSaved,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Money Savings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">
                    {t("dashboard.results.moneySavings.title")}
                  </h3>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("dashboard.results.moneySavings.legalFees")}
                    </span>
                    <span className="font-medium">
                      {t("landing.familyPreparednessCalculator.2_000_8_000_1")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("dashboard.results.moneySavings.lostWages")}
                    </span>
                    <span className="font-medium">
                      €{((income / 160) * timeSaved).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("dashboard.results.moneySavings.penalties")}
                    </span>
                    <span className="font-medium">
                      {t("landing.familyPreparednessCalculator.1_000_5_000_2")}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-semibold">
                        {t("dashboard.results.moneySavings.total")}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        €{moneySaved.toLocaleString("en-EU")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotional Impact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">
                    {t("dashboard-main:dashboard.results.emotional.title")}
                  </h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        {t("dashboard-main:dashboard.results.emotional.stress")}
                      </span>
                      <span className="text-sm font-medium">
                        {stressReduction}%
                      </span>
                    </div>
                    <Progress value={stressReduction} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        {t(
                          "dashboard-main:dashboard.results.emotional.confidence",
                        )}
                      </span>
                      <span className="text-sm font-medium">
                        {confidenceIncrease}%
                      </span>
                    </div>
                    <Progress value={confidenceIncrease} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        {t("dashboard-main:dashboard.results.emotional.peace")}
                      </span>
                      <span className="text-sm font-medium">
                        {controlRating}
                        {t("landing.familyPreparednessCalculator.10_3")}
                      </span>
                    </div>
                    <Progress value={controlRating * 10} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-primary/5 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard.results.socialProof")}
                </p>
                <p className="font-semibold text-primary">
                  {t("dashboard-main:dashboard.results.families")}
                </p>
              </div>

              {/* Context */}
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.results.ctaContext")}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1 animate-pulse"
                  asChild
                >
                  <a href="/register">
                    {t("calculator.results.ctaButton", {
                      amount: moneySaved.toLocaleString(),
                      hours: timeSaved,
                    })}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t("dashboard.results.shareButton")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial */}
        <div className="mt-12 max-w-4xl mx-auto text-center">
          <blockquote className="text-lg text-muted-foreground italic">
            "{t("dashboard-main:dashboard.testimonial.quote")}"
          </blockquote>
          <p className="mt-2 text-sm font-medium">
            — {t("dashboard-main:dashboard.testimonial.author")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FamilyPreparednessCalculator;
