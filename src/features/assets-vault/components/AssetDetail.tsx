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
import { useCountry } from '@/hooks/useCountry';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { useRetry } from '@/utils/retry';
import { RetryStatus } from '@/components/common/RetryStatus';
import { toast } from 'sonner';
import { ArrowLeft, Save, Home, Building, Car, Wallet, ScrollText, Feather } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { handleError, getErrorMessage } from '@/utils/errorHandler';
import { AddLiabilityModal } from '@/components/AddLiabilityModal';
import { EditStoryModal } from '@/components/EditStoryModal';

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
  asset_story?: string;
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
  const [liabilities, setLiabilities] = useState<Array<{
    id: string;
    name: string;
    amount: number;
    type: string;
  }>>([]);
const [showAddLiabilityModal, setShowAddLiabilityModal] = useState(false);
const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  
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
      fetchLiabilities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, isNewAsset]);

  const loadAsset = async () => {
    if (!assetId) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabaseWithRetry
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
        account_type: (data.metadata as Record<string, unknown>)?.account_type as string || '',
        financial_institution: (data.metadata as Record<string, unknown>)?.financial_institution as string || '',
        account_number: (data.metadata as Record<string, unknown>)?.account_number as string || '',
        login_credentials: (data.metadata as Record<string, unknown>)?.login_credentials as string || '',
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error, t);
      handleError(error, {
        operation: 'loadAsset',
        context: 'AssetDetail',
        customMessage: errorMessage
      });
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
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
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
        const { error } = await supabaseWithRetry
          .from('assets')
          .insert([assetData]);

        if (error) throw error;
        
        toast.success(t('assetDetail.messages.createdSuccessfully'));
      } else {
        const { error } = await supabaseWithRetry
          .from('assets')
          .update(assetData)
          .eq('id', assetId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast.success(t('assetDetail.messages.updatedSuccessfully'));
      }

      navigate('/dashboard');
    } catch (error: Record<string, unknown>) {
      const errorMessage = getErrorMessage(error, t);
      handleError(error, {
        operation: 'handleSave',
        context: 'AssetDetail',
        customMessage: errorMessage
      });
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

  const fetchLiabilities = async () => {
    if (isNewAsset || !assetId) return;
    
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('asset_liabilities')
        .select('*')
        .eq('asset_id', assetId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLiabilities(data || []);
    } catch (error: Record<string, unknown>) {
      console.error('Error fetching liabilities:', error);
    }
  };

  const handleStorySaved = (newStory: string) => {
    setAsset(prev => prev ? { ...prev, asset_story: newStory } : null);
  };

  const handleStoryEdit = () => {
    setShowEditStoryModal(true);
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

      {/* Asset Story Section - Only show for existing assets */}
      {!isNewAsset && asset && (
        <Card>
          <CardContent className="pt-6">
            {asset.asset_story ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ScrollText className="h-5 w-5 text-accent-green mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{t('assetDetail.story.title', { type: getAssetTypeLabel(asset.type) })}</h3>
                    <p className="text-text-body italic leading-relaxed">{asset.asset_story}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleStoryEdit}>
                    {t('assetDetail.story.editButton')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <Feather className="h-8 w-8 text-accent-green mb-3" />
                <h3 className="text-lg font-semibold text-text-heading mb-2">{t('assetDetail.story.emptyTitle')}</h3>
                <p className="text-sm text-text-body text-center max-w-md mb-4">
                  {t('assetDetail.story.emptyDescription')}
                </p>
                <Button variant="default" size="sm" onClick={handleStoryEdit}>
                  <Feather className="h-4 w-4 mr-2" />
                  {t('assetDetail.story.addButton')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

    {/* Related Liabilities & Documents Section - Only show for existing assets */}
    {!isNewAsset && assetId && assetId !== 'new' && (
      <Card>
      <CardHeader>
        <CardTitle>{t('assetDetail.sections.liabilitiesAndDocuments')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <Button onClick={() => setShowAddLiabilityModal(true)} variant="outline">
          + {t('assetDetail.buttons.addLiability')}
        </Button>

        {/* Placeholder for rendering related liabilities */}
        <div>
          {liabilities.length === 0 ? (
            <p className="text-muted-foreground">{t('assetDetail.descriptions.noLiabilities')}</p>
          ) : (
            liabilities.map((liability) => (
              <div key={liability.id} className="p-4 border rounded-md mb-4">
                <p><strong>{t('assetDetail.fields.liabilityType')}:</strong> {liability.liability_type}</p>
                <p><strong>{t('assetDetail.fields.providerName')}:</strong> {liability.provider_name}</p>
                <p><strong>{t('assetDetail.fields.referenceNumber')}:</strong> {liability.reference_number}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
    )}

    {/* Add Liability Modal */}
    {showAddLiabilityModal && assetId && assetId !== 'new' && (
      <AddLiabilityModal
        assetId={assetId}
        onClose={() => setShowAddLiabilityModal(false)}
        onLiabilityAdded={fetchLiabilities}
      />
    )}

    {/* Edit Story Modal */}
    {showEditStoryModal && asset && (
      <EditStoryModal
        assetId={asset.id}
        assetName={asset.name}
        currentStory={asset.asset_story}
        onClose={() => setShowEditStoryModal(false)}
        onStorySaved={handleStorySaved}
      />
    )}
    </div>
  );
};
