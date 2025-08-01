import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useSubscription();
  const [isGrantingPremium, setIsGrantingPremium] = useState(false);
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'premium' }),
      });

      const data = await response.json();

      if (data.sessionId) {
        navigate(`/checkout?sessionId=${data.sessionId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      toast.error(t('pricing.errors.checkoutFailed'));
    }
  };

  const handleDevGrantPremium = async () => {
    if (!isDevelopment) return;
    
    setIsGrantingPremium(true);
    try {
      const response = await fetch('/api/dev/grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t('pricing.devMode.successMessage'));
        // Refresh subscription status
        if (refetch) {
          await refetch();
        }
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to grant premium access');
      }
    } catch (error) {
      console.error('Failed to grant dev premium:', error);
      toast.error(t('pricing.devMode.errorMessage'));
    } finally {
      setIsGrantingPremium(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold mb-8">{t('pricing.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">{t('pricing.freePlan.name')}</h2>
          <p className="mb-4">{t('pricing.freePlan.description')}</p>
          <ul className="mb-6">
            <li>{t('pricing.freePlan.features.will')}</li>
            <li>{t('pricing.freePlan.features.guardians')}</li>
            <li>{t('pricing.freePlan.features.assets')}</li>
            <li>{t('pricing.freePlan.features.support')}</li>
          </ul>
          <p className="text-lg font-bold">{t('pricing.freePlan.price')}</p>
        </div>

        {/* Premium Plan */}
        <div className="p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">{t('pricing.premiumPlan.name')}</h2>
          <p className="mb-4">{t('pricing.premiumPlan.description')}</p>
          <ul className="mb-6">
            <li>{t('pricing.premiumPlan.features.will')}</li>
            <li>{t('pricing.premiumPlan.features.guardians')}</li>
            <li>{t('pricing.premiumPlan.features.assets')}</li>
            <li>{t('pricing.premiumPlan.features.encryption')}</li>
            <li>{t('pricing.premiumPlan.features.access')}</li>
            <li>{t('pricing.premiumPlan.features.support')}</li>
            <li>{t('pricing.premiumPlan.features.history')}</li>
            <li>{t('pricing.premiumPlan.features.templates')}</li>
          </ul>
          <p className="text-lg font-bold mb-4">{t('pricing.premiumPlan.price')}</p>
          <Button onClick={handleUpgrade} className="w-full">{t('pricing.premiumPlan.upgradeButton')}</Button>
        </div>
      </div>

      {/* Developer Mode Button - Only visible in development */}
      {isDevelopment && (
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-2 p-4 border-2 border-dashed border-orange-400 rounded-lg bg-orange-50">
            <p className="text-sm text-orange-800 font-medium">{t('pricing.devMode.title')}</p>
            <Button
              onClick={handleDevGrantPremium}
              disabled={isGrantingPremium}
              variant="outline"
              size="sm"
              className="gap-2 border-orange-400 text-orange-700 hover:bg-orange-100"
            >
              <Wrench className="h-4 w-4" />
              {isGrantingPremium ? t('pricing.devMode.button.granting') : t('pricing.devMode.button.grant')}
            </Button>
            <p className="text-xs text-orange-600 max-w-xs">
              {t('pricing.devMode.description')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Pricing;

