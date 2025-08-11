import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAssistant } from "@/hooks/useAssistant";
import { AssistantMessage } from "@/components/assistant/AssistantMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  DollarSign,
  Briefcase,
  Heart,
  TrendingUp,
  Plus,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface CategoryProgress {
  category: string;
  count: number;
  completeness: number;
  nextStep?: string;
}

interface FamilyImpact {
  type: "financial" | "emotional" | "practical";
  description: string;
  value?: string;
}

interface LifeInventoryAssistantProps {
  statistics?: Array<{
    category: string;
    count: number;
    total_value: number;
  }>;
  totalValue?: number;
  unassignedCount?: number;
}

const LifeInventoryAssistant: React.FC<LifeInventoryAssistantProps> = ({
  statistics = [],
  totalValue = 0,
  unassignedCount = 0,
}) => {
  const { t } = useTranslation("assets");
  const navigate = useNavigate();
  const { userProfile, emotionalState } = useAssistant();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate family impact based on current assets
  const calculateFamilyImpact = (): FamilyImpact[] => {
    const impacts: FamilyImpact[] = [];

    if (totalValue > 0) {
      impacts.push({
        type: "financial",
        description: "Your family will have clarity about",
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(totalValue),
      });
    }

    const totalItems = statistics.reduce((sum, stat) => sum + stat.count, 0);
    if (totalItems > 0) {
      impacts.push({
        type: "practical",
        description: `Your family has clear information about ${totalItems} important things`,
      });
    }

    if (unassignedCount === 0 && totalItems > 5) {
      impacts.push({
        type: "emotional",
        description:
          "Your family won't have to search for critical information during difficult times",
      });
    }

    return impacts;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
      property: Home,
      financial: DollarSign,
      business: Briefcase,
      personal: Heart,
      investments: TrendingUp,
    };
    return icons[category] || Info;
  };

  const getCategoryProgress = (category: string): CategoryProgress => {
    const stat = statistics.find((s) => s.category === category);
    const count = stat?.count || 0;

    // Simple completeness calculation
    let completeness = 0;
    let nextStep = "";

    switch (category) {
      case "property":
        completeness = count > 0 ? (count >= 2 ? 100 : 50) : 0;
        nextStep =
          count === 0
            ? "Add your primary residence"
            : "Consider adding other properties";
        break;
      case "financial":
        completeness = count > 0 ? Math.min(count * 25, 100) : 0;
        nextStep =
          count === 0
            ? "Start with your main bank account"
            : "Add savings and investment accounts";
        break;
      case "personal":
        completeness = count > 0 ? Math.min(count * 20, 100) : 0;
        nextStep = "Tell us about items with sentimental value";
        break;
      default:
        completeness = count > 0 ? 50 : 0;
        nextStep = "Add your first item in this category";
    }

    return { category, count, completeness, nextStep };
  };

  const lifeCategories = [
    {
      key: "property",
      title: t("common:categories.property"),
      description: "Your home and other important places",
      color: "#8B5CF6",
    },
    {
      key: "financial",
      title: t("common:categories.financial"),
      description: "Bank accounts, credit cards, and financial services",
      color: "#10B981",
    },
    {
      key: "business",
      title: t("common:categories.business"),
      description: "Business ownership and professional matters",
      color: "#F59E0B",
    },
    {
      key: "personal",
      title: t("common:categories.personal"),
      description: "Valuable items and family treasures",
      color: "#EF4444",
    },
  ];

  const impacts = calculateFamilyImpact();

  return (
    <div className="life-inventory-assistant space-y-6">
      {/* Warm Introduction */}
      <Card className="border-warm-primary/20 bg-gradient-to-br from-warm-light/50 to-background">
        <CardContent className="pt-6">
          <AssistantMessage
            message={{
              type: "guidance",
              content:
                "Let's organize the important things in your life so your family knows what matters and where to find everything. Each item you add helps protect your family from confusion and stress.",
            }}
            isTyping={false}
          />
        </CardContent>
      </Card>

      {/* Life Categories with Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">What matters in your life?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifeCategories.map((category) => {
            const progress = getCategoryProgress(category.key);
            const Icon = getCategoryIcon(category.key);

            return (
              <Card
                key={category.key}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2"
                style={{
                  borderColor:
                    selectedCategory === category.key
                      ? category.color
                      : "transparent",
                }}
                onClick={() => setSelectedCategory(category.key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    {progress.count > 0 && (
                      <Badge variant="secondary">{progress.count}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={progress.completeness} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {progress.nextStep}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assets/new?category=${category.key}`);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add {progress.count === 0 ? "your first" : "another"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Family Impact Preview */}
      {impacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-warm-primary" />
              How this helps your family
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {impacts.map((impact, index) => (
                <div key={index} className="flex items-start gap-3">
                  {impact.type === "financial" && (
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                  )}
                  {impact.type === "emotional" && (
                    <Heart className="h-5 w-5 text-warm-primary mt-0.5" />
                  )}
                  {impact.type === "practical" && (
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {impact.description}{" "}
                      {impact.value && (
                        <span className="font-semibold">{impact.value}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {unassignedCount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {unassignedCount} items need your attention
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                      These items aren't fully organized yet. Your family might
                      have trouble finding information about them.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LifeInventoryAssistant;
