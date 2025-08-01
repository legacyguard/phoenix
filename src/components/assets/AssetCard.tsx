import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, Landmark, Car, Laptop, Gem, Package, Building2, 
  Wallet, Bitcoin, FileText, Shield, Plane, HardDrive,
  Globe, CreditCard, Sparkles, MoreVertical, Eye, Edit, Trash2,
  DollarSign, Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Asset {
  id: string;
  name: string;
  main_category: string;
  sub_type: string;
  estimated_value?: number;
  currency?: string;
  created_at: string;
  details?: Record<string, any>;
}

interface AssetCardProps {
  asset: Asset;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

const getIconForAsset = (subType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    // Property types
    'Primary Residence': <Home className="h-6 w-6" />,
    'Vacation Home': <Home className="h-6 w-6" />,
    'Rental Property': <Building2 className="h-6 w-6" />,
    'Land': <Globe className="h-6 w-6" />,
    'Commercial Property': <Building2 className="h-6 w-6" />,
    
    // Finance types
    'Bank Account': <Landmark className="h-6 w-6" />,
    'Investment Portfolio': <Wallet className="h-6 w-6" />,
    'Cryptocurrency Wallet': <Bitcoin className="h-6 w-6" />,
    'Loan / Mortgage': <FileText className="h-6 w-6" />,
    'Insurance Policy': <Shield className="h-6 w-6" />,
    'Pension / Retirement Account': <Wallet className="h-6 w-6" />,
    
    // Vehicle types
    'Car': <Car className="h-6 w-6" />,
    'Motorcycle': <Car className="h-6 w-6" />,
    'Boat': <Car className="h-6 w-6" />,
    'RV / Camper': <Car className="h-6 w-6" />,
    'Aircraft': <Plane className="h-6 w-6" />,
    
    // Digital Asset types
    'Online Account': <Globe className="h-6 w-6" />,
    'Software License': <HardDrive className="h-6 w-6" />,
    'Domain Name': <Globe className="h-6 w-6" />,
    'Digital Subscription': <CreditCard className="h-6 w-6" />,
    'Cryptocurrency': <Bitcoin className="h-6 w-6" />,
    'NFT': <Sparkles className="h-6 w-6" />,
    
    // Personal Item types
    'Jewelry': <Gem className="h-6 w-6" />,
    'Art / Collectibles': <Sparkles className="h-6 w-6" />,
    'Electronics': <Laptop className="h-6 w-6" />,
    'Furniture': <Package className="h-6 w-6" />,
    'Tools / Equipment': <Package className="h-6 w-6" />,
    'Other Valuables': <Package className="h-6 w-6" />,
    
    // Default
    'Custom Asset': <Package className="h-6 w-6" />,
  };
  
  return iconMap[subType] || <Package className="h-6 w-6" />;
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, onView, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();
  
  const formatCurrency = (value: number | undefined, currency: string = 'USD') => {
    if (!value) return null;
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              {getIconForAsset(asset.sub_type)}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-none tracking-tight">
                {asset.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {asset.main_category} • {asset.sub_type}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(asset)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('common.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(asset)}>
                <Edit className="mr-2 h-4 w-4" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(asset)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {asset.estimated_value && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span className="font-medium">
                  {formatCurrency(asset.estimated_value, asset.currency)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{t('common.addedOn', { date: formatDate(asset.created_at) })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetCard;
