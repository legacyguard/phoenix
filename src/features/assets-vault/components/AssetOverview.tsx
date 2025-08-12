import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabaseWithRetry } from "@/utils/supabaseWithRetry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Car,
  DollarSign,
  Briefcase,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  FileText,
  Users,
  PieChart,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import type {
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import LifeInventoryAssistant from "@/components/assets/LifeInventoryAssistant";

interface AssetStatistics {
  category: string;
  count: number;
  total_value: number;
}

interface UnassignedAsset {
  id: string;
  name: string;
  type: string;
  category: string;
  estimated_value: number;
  total_allocation: number;
}

const CATEGORY_ICONS = {
  property: Home,
  vehicle: Car,
  financial: DollarSign,
  business: Briefcase,
  personal: Package,
  uncategorized: FileText,
};

const CATEGORY_COLORS = {
  property: "#8B5CF6",
  vehicle: "#3B82F6",
  financial: "#10B981",
  business: "#F59E0B",
  personal: "#EF4444",
  uncategorized: "#6B7280",
};

export const AssetOverview: React.FC = () => {
  const { t } = useTranslation("assets");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<AssetStatistics[]>([]);
  const [unassignedAssets, setUnassignedAssets] = useState<UnassignedAsset[]>(
    [],
  );
  const [totalValue, setTotalValue] = useState(0);
  const [currency, setCurrency] = useState("USD");

  const loadAssetData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Get asset statistics
      const { data: statsData, error: statsError } =
        await supabaseWithRetry.rpc("get_asset_statistics", {
          p_user_id: user.id,
        });

      if (statsError) throw statsError;

      const stats = statsData || [];
      setStatistics(stats);

      // Calculate total value
      const total = stats.reduce(
        (sum, stat) => sum + (stat.total_value || 0),
        0,
      );
      setTotalValue(total);

      // Get unassigned assets
      const { data: unassignedData, error: unassignedError } =
        await supabaseWithRetry.rpc("get_unassigned_assets", {
          p_user_id: user.id,
        });

      if (unassignedError) throw unassignedError;
      setUnassignedAssets(unassignedData || []);

      // Get user's preferred currency
      const { data: profileData } = await supabaseWithRetry
        .from("profiles")
        .select("preferred_currency")
        .eq("id", user.id)
        .single();

      if (profileData?.preferred_currency) {
        setCurrency(profileData.preferred_currency);
      }
    } catch (error) {
      console.error("[AssetOverview] Error loading data:", error);
      toast.error(t("errors:errors.loadingAssets"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAssetData();
  }, [loadAssetData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryIcon = (category: string) => {
    const Icon =
      CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || FileText;
    return Icon;
  };

  const getCategoryColor = (category: string) => {
    return (
      CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "#6B7280"
    );
  };

  const chartData = statistics
    .filter((stat) => stat.count > 0)
    .map((stat) => ({
      name: t(`categories.${stat.category}`),
      value: stat.total_value || 0,
      count: stat.count,
    }));

  const handleAddAsset = (category?: string) => {
    const searchParams = category ? `?category=${category}` : "";
    navigate(`/assets/new${searchParams}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" data-testid="assetoverview-skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" data-testid="assetoverview-skeleton" />
          <Skeleton className="h-64" data-testid="assetoverview-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("vault.title")}</h2>
          <p className="text-muted-foreground">{t("vault.subtitle")}</p>
        </div>
      </div>

      {/* Life Inventory Assistant */}
      <LifeInventoryAssistant
        statistics={statistics}
        totalValue={totalValue}
        unassignedCount={unassignedAssets.length} data-testid="assetoverview-lifeinventoryassistant"
      />

      {/* Quick Stats Summary */}
      {totalValue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card data-testid="assetoverview-card">
            <CardHeader className="pb-3" data-testid="assetoverview-total-value-protected">
              <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="assetoverview-total-value-protected">
                Total Value Protected
              </CardTitle>
            </CardHeader>
            <CardContent data-testid="assetoverview-formatcurrency-totalvalue">
              <div className="text-2xl font-bold">
                {formatCurrency(totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="assetoverview-card">
            <CardHeader className="pb-3" data-testid="assetoverview-items-documented">
              <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="assetoverview-items-documented">
                Items Documented
              </CardTitle>
            </CardHeader>
            <CardContent data-testid="assetoverview-sum-stat-count-0">
              <div className="text-2xl font-bold">
                {statistics.reduce((sum, stat) => sum + stat.count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="assetoverview-card">
            <CardHeader className="pb-3" data-testid="assetoverview-categories-covered">
              <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="assetoverview-categories-covered">
                Categories Covered
              </CardTitle>
            </CardHeader>
            <CardContent data-testid="assetoverview-s-count-0-length">
              <div className="text-2xl font-bold">
                {statistics.filter((s) => s.count > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {unassignedAssets.length > 0 && (
        <Card data-testid="assetoverview-card">
          <CardHeader data-testid="assetoverview-cardheader">
            <CardTitle className="flex items-center gap-2" data-testid="assetoverview-items-that-need-organization">
              <AlertCircle className="h-5 w-5 text-amber-600" data-testid="assetoverview-alertcircle" />
              Items That Need Organization
            </CardTitle>
            <CardDescription data-testid="assetoverview-carddescription">
              Help your family by completing information about these items
            </CardDescription>
          </CardHeader>
          <CardContent data-testid="assetoverview-control">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {unassignedAssets.slice(0, 5).map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  <div className="flex items-center gap-3">
                    {React.createElement(getCategoryIcon(asset.category), {
                      className: "h-4 w-4 text-muted-foreground",
                    })}
                    <div>
                      <span className="text-sm font-medium">{asset.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {asset.total_allocation < 50
                          ? "Needs more information"
                          : "Almost complete"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={asset.total_allocation}
                      className="w-20 h-2" data-testid="assetoverview-progress"
                    />
                    <span className="text-xs text-muted-foreground">
                      {asset.total_allocation}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {unassignedAssets.length > 5 && (
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => navigate("/dashboard")} data-testid="assetoverview-view-all-unassignedassets-length-items"
              >
                View All {unassignedAssets.length} Items
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
