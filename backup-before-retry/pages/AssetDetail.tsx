import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from '@/components/common/CountrySelector';
import { useCountry } from '@/contexts/CountryContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Home, Building, Car, Wallet } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: string;
  address?: string;
  property_registry_number?: string;
  estimated_value?: number;
  currency_code: string;
  metadata: Record<string, unknown>;
}

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
];

export const AssetDetail: React.FC = () => {
  const { t } = useTranslation('common');
  const { assetId } = useParams<{ assetId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedCountryCode } = useCountry();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: searchParams.get('type') || 'RealEstate',
    address: '',
    property_registry_number: '',
    estimated_value: '',
    currency_code: 'EUR',
    // Financial Account specific fields
    account_type: '',
    financial_institution: '',
    account_number: '',
    login_credentials: '',
  });

  const isNewAsset = assetId === 'new';

  useEffect(() => {
     
    if (!isNewAsset && assetId) {
      loadAsset();
    }
  }, [assetId, isNewAsset]);

  const loadAsset = async () => {
    if (!assetId) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setAsset(data);
      setFormData({
        name: data.name || '',
        type: data.type || 'RealEstate',
        address: data.address || '',
        property_registry_number: data.property_registry_number || '',
        estimated_value: data.estimated_value?.toString() || '',
        currency_code: data.currency_code || 'EUR',
        // Financial Account specific fields
        account_type: (data.metadata as Record<string, unknown>)?.account_type || '',
        financial_institution: (data.metadata as Record<string, unknown>)?.financial_institution || '',
        account_number: (data.metadata as Record<string, unknown>)?.account_number || '',
        login_credentials: (data.metadata as Record<string, unknown>)?.login_credentials || '',
      });
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Neznáma chyba';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Detail majetku] Chyba pri načítanie majetku:', {
        timestamp,
        operation: 'loadAsset',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
      let userMessage = 'Nastala chyba pri načítanie majetku.';
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
        userMessage = 'Požadované dáta neboli nájdené.';
      } else if (error?.message?.includes('network')) {
        userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
      } else if (error?.message?.includes('permission')) {
        userMessage = 'Nemáte oprávnenie na túto akciu.';
      } else if (error?.message?.includes('duplicate')) {
        userMessage = 'Takýto záznam už existuje.';
      }
      
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t('assetDetail.errors.nameRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const assetData = {
        user_id: user.id,
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim() || null,
        property_registry_number: formData.property_registry_number.trim() || null,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        currency_code: formData.currency_code,
        metadata: formData.type === 'FinancialAccount' ? {
          account_type: formData.account_type,
          financial_institution: formData.financial_institution,
          account_number: formData.account_number,
          login_credentials: formData.login_credentials,
        } : {},
      };

      if (isNewAsset) {
        const { error } = await supabase
          .from('assets')
          .insert([assetData]);

        if (error) throw error;
        
        toast.success(t('assetDetail.messages.createdSuccessfully'));
      } else {
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', assetId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast.success(t('assetDetail.messages.updatedSuccessfully'));
      }

      navigate('/dashboard');
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Neznáma chyba';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Detail majetku] Chyba pri uloženie majetku:', {
        timestamp,
        operation: 'handleSave',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
      let userMessage = 'Nastala chyba pri uloženie majetku.';
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
        userMessage = 'Požadované dáta neboli nájdené.';
      } else if (error?.message?.includes('network')) {
        userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
      } else if (error?.message?.includes('permission')) {
        userMessage = 'Nemáte oprávnenie na túto akciu.';
      } else if (error?.message?.includes('duplicate')) {
        userMessage = 'Takýto záznam už existuje.';
      }
      
      toast.error(userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'RealEstate':
        return <Home className="h-6 w-6" />;
      case 'Business':
        return <Building className="h-6 w-6" />;
      case 'Vehicle':
        return <Car className="h-6 w-6" />;
      case 'FinancialAccount':
        return <Wallet className="h-6 w-6" />;
      default:
        return <Home className="h-6 w-6" />;
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'RealEstate':
        return t('assetDetail.types.realEstate');
      case 'Business':
        return t('assetDetail.types.business');
      case 'Vehicle':
        return t('assetDetail.types.vehicle');
      case 'FinancialAccount':
        return t('assetDetail.types.financialAccount');
      default:
        return t('assetDetail.types.asset');
    }
  };

  if (isLoading) {
    return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('assetDetail.loading')}</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          {getAssetIcon(formData.type)}
          <div>
            <h1 className="text-2xl font-bold">
              {isNewAsset ? t('assetDetail.title.new', { type: getAssetTypeLabel(formData.type) }) : formData.name}
            </h1>
            <p className="text-muted-foreground">
              {isNewAsset ? t('assetDetail.subtitle.new') : t('assetDetail.subtitle.edit')}
            </p>
          </div>
        </div>
      </div>

      {/* Asset Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('assetDetail.sections.assetInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('assetDetail.sections.basicInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('assetDetail.fields.assetName')} *</Label>
                <Input
                  id="name"
                  placeholder={t('assetDetail.placeholders.assetName')}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('assetDetail.descriptions.assetName')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t('assetDetail.fields.assetType')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RealEstate">{t('assetDetail.types.realEstate')}</SelectItem>
                    <SelectItem value="Business">{t('assetDetail.types.business')}</SelectItem>
                    <SelectItem value="Vehicle">{t('assetDetail.types.vehicle')}</SelectItem>
                    <SelectItem value="FinancialAccount">{t('assetDetail.types.financialAccount')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('assetDetail.descriptions.assetType')}
                </p>
              </div>
            </div>
          </div>

          {/* Real Estate Specific Fields */}
          {formData.type === 'RealEstate' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t('assetDetail.sections.propertyDetails')}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{t('assetDetail.fields.propertyAddress')}</Label>
                  <Textarea
                    id="address"
                    placeholder={t('assetDetail.placeholders.propertyAddress')}
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('assetDetail.descriptions.propertyAddress')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registry">{t('assetDetail.fields.propertyRegistryNumber')}</Label>
                  <Input
                    id="registry"
                    placeholder={t('assetDetail.placeholders.propertyRegistryNumber')}
                    value={formData.property_registry_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, property_registry_number: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('assetDetail.descriptions.propertyRegistryNumber')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Account Specific Fields */}
          {formData.type === 'FinancialAccount' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t('assetDetail.sections.accountDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accountType">{t('assetDetail.fields.accountType')}</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('assetDetail.placeholders.selectAccountType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Account">{t('assetDetail.accountTypes.bankAccount')}</SelectItem>
                      <SelectItem value="Investment Portfolio">{t('assetDetail.accountTypes.investmentPortfolio')}</SelectItem>
                      <SelectItem value="Pension Fund">{t('assetDetail.accountTypes.pensionFund')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t('assetDetail.descriptions.accountType')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">{t('assetDetail.fields.financialInstitution')}</Label>
                  <Input
                    id="institution"
                    placeholder={t('assetDetail.placeholders.financialInstitution')}
                    value={formData.financial_institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, financial_institution: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('assetDetail.descriptions.financialInstitution')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">{t('assetDetail.fields.accountNumber')}</Label>
                <Input
                  id="accountNumber"
                  placeholder={t('assetDetail.placeholders.accountNumber')}
                  value={formData.account_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('assetDetail.descriptions.accountNumber')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentials">{t('assetDetail.fields.loginCredentials')}</Label>
                <Textarea
                  id="credentials"
                  placeholder={t('assetDetail.placeholders.loginCredentials')}
                  value={formData.login_credentials}
                  onChange={(e) => setFormData(prev => ({ ...prev, login_credentials: e.target.value }))}
                  rows={3}
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>{t('assetDetail.securityWarning')}</strong> {t('assetDetail.securityWarningText')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('assetDetail.sections.financialDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="value">{t('assetDetail.fields.estimatedValue')}</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={t('assetDetail.placeholders.estimatedValue')}
                  value={formData.estimated_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('assetDetail.descriptions.estimatedValue')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('assetDetail.fields.currency')}</Label>
                <Select
                  value={formData.currency_code}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency_code: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('assetDetail.descriptions.currency')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isSaving}
            >
              {t('assetDetail.buttons.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('assetDetail.buttons.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isNewAsset ? t('assetDetail.buttons.createAsset') : t('assetDetail.buttons.updateAsset')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};