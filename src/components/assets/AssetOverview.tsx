import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  Car,
  DollarSign,
  Briefcase,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  FileText,
  Users,
  PieChart,
  BarChart3 } from
'lucide-react';
import { toast } from 'sonner';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
  uncategorized: FileText
};

const CATEGORY_COLORS = {
  property: '#8B5CF6',
  vehicle: '#3B82F6',
  financial: '#10B981',
  business: '#F59E0B',
  personal: '#EF4444',
  uncategorized: '#6B7280'
};

export const AssetOverview: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<AssetStatistics[]>([]);
  const [unassignedAssets, setUnassignedAssets] = useState<UnassignedAsset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
     
    loadAssetData();
  }, []);

  const loadAssetData = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Get asset statistics
      const { data: statsData, error: statsError } = await supabaseWithRetry.
      rpc('get_asset_statistics', { p_user_id: user.id });

      if (statsError) throw statsError;

      const stats = statsData || [];
      setStatistics(stats);

      // Calculate total value
      const total = stats.reduce((sum, stat) => sum + (stat.total_value || 0), 0);
      setTotalValue(total);

      // Get unassigned assets
      const { data: unassignedData, error: unassignedError } = await supabaseWithRetry.
      rpc('get_unassigned_assets', { p_user_id: user.id });

      if (unassignedError) throw unassignedError;
      setUnassignedAssets(unassignedData || []);

      // Get user's preferred currency
      const { data: profileData } = await supabaseWithRetry.
      from('profiles').
      select('preferred_currency').
      eq('id', user.id).
      single();

      if (profileData?.preferred_currency) {
        setCurrency(profileData.preferred_currency);
      }

    } catch (error) {
      console.error('[AssetOverview] Error loading data:', error);
      toast.error(t('assets.overview.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || FileText;
    return Icon;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6B7280';
  };

  const chartData = statistics.
  filter((stat) => stat.count > 0).
  map((stat) => ({
    name: t(`assets.categories.${stat.category}`),
    value: stat.total_value || 0,
    count: stat.count
  }));

  const handleAddAsset = (category?: string) => {
    const searchParams = category ? `?category=${category}` : '';
    navigate(`/assets/new${searchParams}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) =>
          <Skeleton key={i} className="h-32" />
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('assets.overview.title')}</h2>
          <p className="text-muted-foreground">{t('assets.overview.subtitle')}</p>
        </div>
        <Button onClick={() => handleAddAsset()}>
          <Plus className="h-4 w-4 mr-2" />
          {t('assets.overview.addAsset')}
        </Button>
      </div>

      {/* Total Portfolio Value */}
      {totalValue > 0 &&
      <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('assets.overview.totalPortfolioValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('assets.overview.estimatedValue')}
            </p>
          </CardContent>
        </Card>
      }

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['property', 'vehicle', 'financial', 'business', 'personal'].map((category) => {
          const stat = statistics.find((s) => s.category === category) || { count: 0, total_value: 0 };
          const Icon = getCategoryIcon(category);
          const color = getCategoryColor(category);

          return (
            <Card
              key={category}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard?category=${category}`)}>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${color}20` }}>

                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <CardTitle className="text-base">
                      {t(`assets.categories.${category}`)}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">{stat.count}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stat.total_value > 0 &&
                  <p className="text-lg font-semibold">
                      {formatCurrency(stat.total_value)}
                    </p>
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddAsset(category);
                    }}>

                    <Plus className="h-3 w-3 mr-1" />
                    {t('assets.overview.addNew')}
                  </Button>
                </div>
              </CardContent>
            </Card>);

        })}

        {/* Uncategorized */}
        {statistics.find((s) => s.category === 'uncategorized')?.count > 0 &&
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/dashboard?category=uncategorized')}>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <CardTitle className="text-base">
                    {t('assets.categories.uncategorized')}
                  </CardTitle>
                </div>
                <Badge variant="secondary">
                  {statistics.find((s) => s.category === 'uncategorized')?.count || 0}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Distribution Chart */}
        {chartData.length > 0 && totalValue > 0 &&
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t('assets.overview.distribution.title')}
              </CardTitle>
              <CardDescription>
                {t('assets.overview.distribution.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width={t("assets.assetOverview.100_2")} height={t("assets.assetOverview.100_2")}>
                  <RechartsChart>
                    <Pie
                    data={chartData}
                    cx={t("assets.assetOverview.50_4")}
                    cy={t("assets.assetOverview.50_4")}
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">

                      {chartData.map((entry, index) => {
                      const category = statistics[index]?.category;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={getCategoryColor(category)} />);


                    })}
                    </Pie>
                    <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }} />

                    <Legend />
                  </RechartsChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        }

        {/* Unassigned Assets Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('assets.overview.beneficiaryAllocation.title')}
            </CardTitle>
            <CardDescription>
              {t('assets.overview.beneficiaryAllocation.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unassignedAssets.length === 0 ?
            <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50">
                    ✓ {t('assets.overview.beneficiaryAllocation.allAssigned')}
                  </Badge>
                </AlertDescription>
              </Alert> :

            <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('assets.overview.beneficiaryAllocation.unassignedWarning', {
                    count: unassignedAssets.length
                  })}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unassignedAssets.map((asset) =>
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/assets/${asset.id}`)}>

                      <div className="flex items-center gap-2">
                        {React.createElement(getCategoryIcon(asset.category), {
                      className: 'h-4 w-4 text-muted-foreground'
                    })}
                        <span className="text-sm font-medium">{asset.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                      value={asset.total_allocation}
                      className="w-20 h-2" />

                        <span className="text-xs text-muted-foreground">
                          {asset.total_allocation}%
                        </span>
                      </div>
                    </div>
                )}
                </div>

                <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard/inheritance-summary')}>

                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('assets.overview.viewInheritanceSummary')}
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>);

};