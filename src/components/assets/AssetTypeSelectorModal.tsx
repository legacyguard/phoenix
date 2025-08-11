import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, Landmark, Car, Laptop, Gem, PlusCircle, Building2, 
  Wallet, Bitcoin, FileText, Shield, Plane, HardDrive,
  Globe, CreditCard, Sparkles, Package
} from 'lucide-react';

interface AssetTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCategory: string;
  onSelectSubType: (subType: string) => void;
}

const AssetTypeSelectorModal: React.FC<AssetTypeSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  mainCategory,
  onSelectSubType 
}) => {
  const { t } = useTranslation('assets');
  const getSubTypes = () => {
    switch (mainCategory) {
      case 'Property':
        return [
          { label: t('assetType.primaryResidence'), icon: <Home className="h-8 w-8" />, value: 'Primary Residence' },
          { label: t('assetType.vacationHome'), icon: <Home className="h-8 w-8" />, value: 'Vacation Home' },
          { label: t('assetType.rentalProperty'), icon: <Building2 className="h-8 w-8" />, value: 'Rental Property' },
          { label: t('assetType.land'), icon: <Globe className="h-8 w-8" />, value: 'Land' },
          { label: t('assetType.commercialProperty'), icon: <Building2 className="h-8 w-8" />, value: 'Commercial Property' },
        ];
      case 'Finances':
        return [
          { label: t('assetType.bankAccount'), icon: <Landmark className="h-8 w-8" />, value: 'Bank Account' },
          { label: t('assetType.investmentPortfolio'), icon: <Wallet className="h-8 w-8" />, value: 'Investment Portfolio' },
          { label: t('assetType.cryptocurrencyWallet'), icon: <Bitcoin className="h-8 w-8" />, value: 'Cryptocurrency Wallet' },
          { label: t('assetType.loanMortgage'), icon: <FileText className="h-8 w-8" />, value: 'Loan / Mortgage' },
          { label: t('assetType.insurancePolicy'), icon: <Shield className="h-8 w-8" />, value: 'Insurance Policy' },
          { label: t('assetType.pensionRetirement'), icon: <Wallet className="h-8 w-8" />, value: 'Pension / Retirement Account' },
        ];
      case 'Vehicle':
        return [
          { label: t('assetType.car'), icon: <Car className="h-8 w-8" />, value: 'Car' },
          { label: t('assetType.motorcycle'), icon: <Car className="h-8 w-8" />, value: 'Motorcycle' },
          { label: t('assetType.boat'), icon: <Car className="h-8 w-8" />, value: 'Boat' },
          { label: t('assetType.rvCamper'), icon: <Car className="h-8 w-8" />, value: 'RV / Camper' },
          { label: t('assetType.aircraft'), icon: <Plane className="h-8 w-8" />, value: 'Aircraft' },
        ];
      case 'Digital Asset':
        return [
          { label: t('assetType.onlineAccount'), icon: <Globe className="h-8 w-8" />, value: 'Online Account' },
          { label: t('assetType.softwareLicense'), icon: <HardDrive className="h-8 w-8" />, value: 'Software License' },
          { label: t('assetType.domainName'), icon: <Globe className="h-8 w-8" />, value: 'Domain Name' },
          { label: t('assetType.digitalSubscription'), icon: <CreditCard className="h-8 w-8" />, value: 'Digital Subscription' },
          { label: t('assetType.cryptocurrency'), icon: <Bitcoin className="h-8 w-8" />, value: 'Cryptocurrency' },
          { label: t('assetType.nft'), icon: <Sparkles className="h-8 w-8" />, value: 'NFT' },
        ];
      case 'Personal Item':
        return [
          { label: t('assetType.jewelry'), icon: <Gem className="h-8 w-8" />, value: 'Jewelry' },
          { label: t('assetType.artCollectibles'), icon: <Sparkles className="h-8 w-8" />, value: 'Art / Collectibles' },
          { label: t('assetType.electronics'), icon: <Laptop className="h-8 w-8" />, value: 'Electronics' },
          { label: t('assetType.furniture'), icon: <Package className="h-8 w-8" />, value: 'Furniture' },
          { label: t('assetType.toolsEquipment'), icon: <Package className="h-8 w-8" />, value: 'Tools / Equipment' },
          { label: t('assetType.otherValuables'), icon: <Package className="h-8 w-8" />, value: 'Other Valuables' },
        ];
      case 'Other':
        return [
          { label: t('assetType.customAsset'), icon: <PlusCircle className="h-8 w-8" />, value: 'Custom Asset' },
        ];
      default:
        return [];
    }
  };

  const subTypes = getSubTypes();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('assetType.selectType', { mainCategory })}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {subTypes.map((subType) => (
            <Card
              key={subType.value}
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary p-6"
              onClick={() => onSelectSubType(subType.value)}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  {subType.icon}
                </div>
                <h3 className="text-sm font-semibold text-center">{subType.label}</h3>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetTypeSelectorModal;

