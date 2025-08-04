import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface DynamicAssetFormProps {
  mainCategory: string;
  subType: string;
  onClose: () => void;
  isOpen: boolean;
}

const DynamicAssetForm: React.FC<DynamicAssetFormProps> = ({ mainCategory, subType, onClose, isOpen }) => {
  // Translation hook for internationalization
  const { t } = useTranslation('assets');
  
  // Form state management
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  
  // Component logic starts here

  const handleInputChange = (field: string, value: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderFields = () => {
    switch (subType) {
      case 'Primary Residence':
      case 'Vacation Home':
      case 'Rental Property':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">{t('dynamicAssetForm.propertyAddress')}</Label>
                <Input id="address" placeholder={t("dynamicAssetForm.placeholders.123_main_st_city_state_zip_1")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_date">{t('dynamicAssetForm.purchaseDate')}</Label>
                  <Input id="purchase_date" type="date" />
                </div>
                <div>
                  <Label htmlFor="purchase_price">{t('dynamicAssetForm.purchasePrice')}</Label>
                  <Input id="purchase_price" type="number" placeholder="500000" />
                </div>
              </div>
              <div>
                <Label htmlFor="current_value">{t('dynamicAssetForm.currentEstimatedValue')}</Label>
                <Input id="current_value" type="number" placeholder="600000" />
              </div>
              <div>
                <Label htmlFor="mortgage_info">{t('dynamicAssetForm.mortgageInformation')}</Label>
                <Textarea id="mortgage_info" placeholder={t("dynamicAssetForm.placeholders.lender_name_account_number_rem_2")} />
              </div>
              <div>
                <Label htmlFor="property_docs">{t('dynamicAssetForm.locationOfPropertyDocuments')}</Label>
                <Input id="property_docs" placeholder={t("dynamicAssetForm.placeholders.e_g_safe_deposit_box_filing_ca_3")} />
              </div>
            </div>
          </>);


      case 'Land':
      case 'Commercial Property':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">{t('dynamicAssetForm.locationAddress')}</Label>
                <Input id="location" placeholder={t("dynamicAssetForm.placeholders.property_location_or_parcel_nu_4")} />
              </div>
              <div>
                <Label htmlFor="size">{t('dynamicAssetForm.size')}</Label>
                <Input id="size" placeholder={t("dynamicAssetForm.placeholders.e_g_10_acres_5")} />
              </div>
              <div>
                <Label htmlFor="zoning">{t('dynamicAssetForm.zoningType')}</Label>
                <Input id="zoning" placeholder={t("dynamicAssetForm.placeholders.e_g_commercial_agricultural_6")} />
              </div>
              <div>
                <Label htmlFor="current_use">{t('dynamicAssetForm.currentUse')}</Label>
                <Textarea id="current_use" placeholder={t("dynamicAssetForm.placeholders.describe_current_use_of_the_pr_7")} />
              </div>
            </div>
          </>);


      case 'Bank Account':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank_name">{t('dynamicAssetForm.bankName')}</Label>
                <Input id="bank_name" placeholder={t("dynamicAssetForm.placeholders.e_g_chase_bank_8")} />
              </div>
              <div>
                <Label htmlFor="account_type">{t('dynamicAssetForm.accountType')}</Label>
                <Select onValueChange={(value) => handleInputChange('account_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dynamicAssetForm.selectAccountType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">{t('dynamicAssetForm.checking')}</SelectItem>
                    <SelectItem value="savings">{t('dynamicAssetForm.savings')}</SelectItem>
                    <SelectItem value="money_market">{t('dynamicAssetForm.moneyMarket')}</SelectItem>
                    <SelectItem value="cd">{t('dynamicAssetForm.certificateOfDeposit')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account_holder">{t('dynamicAssetForm.accountHolderName')}</Label>
                <Input id="account_holder" placeholder={t("dynamicAssetForm.placeholders.john_doe_9")} />
              </div>
              <div>
                <Label htmlFor="account_number">{t('dynamicAssetForm.accountNumberLast4')}</Label>
                <Input id="account_number" placeholder={t("dynamicAssetForm.placeholders.1234_10")} maxLength={4} />
              </div>
              <div>
                <Label htmlFor="routing_number">{t('dynamicAssetForm.routingNumber')}</Label>
                <Input id="routing_number" placeholder="123456789" />
              </div>
            </div>
          </>);


      case 'Investment Portfolio':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="broker_name">{t('dynamicAssetForm.brokerageFirm')}</Label>
                <Input id="broker_name" placeholder={t("dynamicAssetForm.placeholders.e_g_fidelity_vanguard_11")} />
              </div>
              <div>
                <Label htmlFor="account_number">{t('dynamicAssetForm.accountNumber')}
                </Label>
                <Input id="account_number" placeholder={t("dynamicAssetForm.placeholders.account_number_12")} />
              </div>
              <div>
                <Label htmlFor="account_type">{t('dynamicAssetForm.accountType')}</Label>
                <Select onValueChange={(value) => handleInputChange('account_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dynamicAssetForm.selectAccountType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t('dynamicAssetForm.individual')}</SelectItem>
                    <SelectItem value="joint">{t('dynamicAssetForm.joint')}</SelectItem>
                    <SelectItem value="ira">{t('dynamicAssetForm.ira')}</SelectItem>
                    <SelectItem value="roth_ira">{t('dynamicAssetForm.rothIra')}</SelectItem>
                    <SelectItem value="401k">{t('dynamicAssetForm.401k')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approximate_value">{t('dynamicAssetForm.approximateValue')}</Label>
                <Input id="approximate_value" type="number" placeholder="100000" />
              </div>
              <div>
                <Label htmlFor="advisor_info">{t('dynamicAssetForm.financialAdvisor')}</Label>
                <Input id="advisor_info" placeholder={t("dynamicAssetForm.placeholders.name_and_contact_information_13")} />
              </div>
            </div>
          </>);


      case 'Cryptocurrency Wallet':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="wallet_name">{t('dynamicAssetForm.walletNameLabel')}</Label>
                <Input id="wallet_name" placeholder={t("dynamicAssetForm.placeholders.e_g_main_bitcoin_wallet_14")} />
              </div>
              <div>
                <Label htmlFor="wallet_type">{t('dynamicAssetForm.walletType')}</Label>
                <Select onValueChange={(value) => handleInputChange('wallet_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dynamicAssetForm.selectWalletType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">{t('dynamicAssetForm.hardwareWallet')}</SelectItem>
                    <SelectItem value="software">{t('dynamicAssetForm.softwareWallet')}</SelectItem>
                    <SelectItem value="exchange">{t('dynamicAssetForm.exchangeWallet')}</SelectItem>
                    <SelectItem value="paper">{t('dynamicAssetForm.paperWallet')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cryptocurrencies">{t('dynamicAssetForm.cryptocurrenciesHeld')}</Label>
                <Input id="cryptocurrencies" placeholder={t("dynamicAssetForm.placeholders.e_g_bitcoin_ethereum_15")} />
              </div>
              <div>
                <Label htmlFor="seed_location">{t('dynamicAssetForm.locationOfSeedPhrase')}</Label>
                <Input id="seed_location" placeholder={t("dynamicAssetForm.placeholders.do_not_enter_the_actual_seed_p_16")} />
              </div>
              <div>
                <Label htmlFor="exchange_info">{t('dynamicAssetForm.exchangeInformation')}</Label>
                <Input id="exchange_info" placeholder={t("dynamicAssetForm.placeholders.exchange_name_and_account_emai_17")} />
              </div>
            </div>
          </>);


      case 'Car':
      case 'Motorcycle':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="make_model">{t('dynamicAssetForm.makeAndModel')}</Label>
                <Input id="make_model" placeholder={t("dynamicAssetForm.placeholders.e_g_toyota_camry_18")} />
              </div>
              <div>
                <Label htmlFor="year">{t('dynamicAssetForm.year')}</Label>
                <Input id="year" type="number" placeholder="2022" />
              </div>
              <div>
                <Label htmlFor="vin">{t('dynamicAssetForm.vinNumber')}</Label>
                <Input id="vin" placeholder={t("dynamicAssetForm.placeholders.vehicle_identification_number_19")} />
              </div>
              <div>
                <Label htmlFor="license_plate">{t('dynamicAssetForm.licensePlate')}</Label>
                <Input id="license_plate" placeholder="ABC123" />
              </div>
              <div>
                <Label htmlFor="loan_info">{t('dynamicAssetForm.loanInformation')}</Label>
                <Textarea id="loan_info" placeholder={t("dynamicAssetForm.placeholders.lender_account_number_payoff_a_20")} />
              </div>
              <div>
                <Label htmlFor="title_location">{t('dynamicAssetForm.locationOfTitle')}</Label>
                <Input id="title_location" placeholder={t("dynamicAssetForm.placeholders.e_g_safe_deposit_box_21")} />
              </div>
            </div>
          </>);


      case 'Online Account':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform_name">{t('dynamicAssetForm.platformWebsiteName')}</Label>
                <Input id="platform_name" placeholder={t("dynamicAssetForm.placeholders.e_g_gmail_facebook_22")} />
              </div>
              <div>
                <Label htmlFor="account_email">{t('dynamicAssetForm.accountEmail')}</Label>
                <Input id="account_email" placeholder={t("dynamicAssetForm.placeholders.user_example_com_23")} />
              </div>
              <div>
                <Label htmlFor="account_purpose">{t('dynamicAssetForm.accountPurpose')}</Label>
                <Textarea id="account_purpose" placeholder={t("dynamicAssetForm.placeholders.what_this_account_is_used_for_24")} />
              </div>
              <div>
                <Label htmlFor="recovery_info">{t('dynamicAssetForm.recoveryInformation')}</Label>
                <Textarea id="recovery_info" placeholder={t("dynamicAssetForm.placeholders.recovery_email_phone_or_securi_25")} />
              </div>
              <div>
                <Label htmlFor="2fa_info">{t('dynamicAssetForm.faMethod')}</Label>
                <Input id="2fa_info" placeholder={t("dynamicAssetForm.placeholders.e_g_sms_to_phone_ending_in_123_26")} />
              </div>
            </div>
          </>);


      case 'Jewelry':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="item_description">{t('dynamicAssetForm.itemDescription')}</Label>
                <Input id="item_description" placeholder={t("dynamicAssetForm.placeholders.e_g_diamond_engagement_ring_27")} />
              </div>
              <div>
                <Label htmlFor="appraisal_value">{t('dynamicAssetForm.appraisedValue')}</Label>
                <Input id="appraisal_value" type="number" placeholder="5000" />
              </div>
              <div>
                <Label htmlFor="appraisal_date">{t('dynamicAssetForm.lastAppraisalDate')}</Label>
                <Input id="appraisal_date" type="date" />
              </div>
              <div>
                <Label htmlFor="storage_location">{t('dynamicAssetForm.storageLocation')}</Label>
                <Input id="storage_location" placeholder={t("dynamicAssetForm.placeholders.e_g_home_safe_bank_deposit_box_28")} />
              </div>
              <div>
                <Label htmlFor="insurance_info">{t('dynamicAssetForm.insuranceInformation')}</Label>
                <Textarea id="insurance_info" placeholder={t("dynamicAssetForm.placeholders.policy_number_and_company_29")} />
              </div>
              <div>
                <Label htmlFor="sentimental_notes">{t('dynamicAssetForm.sentimentalValue')}</Label>
                <Textarea id="sentimental_notes" placeholder={t("dynamicAssetForm.placeholders.special_meaning_or_history_of__30")} />
              </div>
            </div>
          </>);


      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="asset_name">{t('dynamicAssetForm.assetName')}</Label>
              <Input id="asset_name" placeholder={t("dynamicAssetForm.placeholders.name_or_description_of_asset_31")} />
            </div>
            <div>
              <Label htmlFor="asset_value">{t('dynamicAssetForm.estimatedValue')}</Label>
              <Input id="asset_value" type="number" placeholder="0" />
            </div>
            <div>
              <Label htmlFor="asset_description">{t('dynamicAssetForm.description')}</Label>
              <Textarea id="asset_description" placeholder={t("dynamicAssetForm.placeholders.detailed_description_of_the_as_32")} rows={4} />
            </div>
            <div>
              <Label htmlFor="asset_location">{t('dynamicAssetForm.locationAccessInformation')}</Label>
              <Textarea id="asset_location" placeholder={t("dynamicAssetForm.placeholders.where_to_find_this_asset_or_ho_33")} />
            </div>
          </div>);

    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('dynamicAssetForm.addSubType', { subType })}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {renderFields()}
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>{t('dynamicAssetForm.cancel')}</Button>
          <Button onClick={() => {
            console.log('Saving asset:', { mainCategory, subType, details: formData });
            onClose();
          }}>{t('dynamicAssetForm.saveAsset')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

};

export default DynamicAssetForm;