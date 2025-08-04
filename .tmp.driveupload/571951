import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Lock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

export const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/95">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">{t('app.name')}</span>
            </div>
            <p className="text-sm text-muted-foreground font-heritage italic">
              "{t('footer.tagline')}"
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-3">{t('footer.platform.title')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={t("common.footer.vault_1")} className="hover:text-primary transition-colors">{t('footer.platform.heritageVault')}</Link></li>
              <li><Link to={t("common.footer.guardians_2")} className="hover:text-primary transition-colors">{t('footer.platform.guardianNetwork')}</Link></li>
              <li><Link to={t("common.footer.dashboard_3")} className="hover:text-primary transition-colors">{t('footer.platform.dashboard')}</Link></li>
              <li><Link to={t("common.footer.security_4")} className="hover:text-primary transition-colors">{t('footer.platform.security')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3">{t('footer.support.title')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={t("common.footer.help_5")} className="hover:text-primary transition-colors">{t('footer.support.helpCenter')}</Link></li>
              <li><Link to={t("common.footer.guides_6")} className="hover:text-primary transition-colors">{t('footer.support.userGuides')}</Link></li>
              <li><Link to={t("common.footer.contact_7")} className="hover:text-primary transition-colors">{t('footer.support.contactUs')}</Link></li>
              <li><Link to={t("common.footer.community_8")} className="hover:text-primary transition-colors">{t('footer.support.community')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3">{t('footer.legal.title')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={t("common.footer.privacy_policy_9")} className="hover:text-primary transition-colors">{t('footer.legal.privacyPolicy')}</Link></li>
              <li><Link to={t("common.footer.terms_10")} className="hover:text-primary transition-colors">{t('footer.legal.termsOfService')}</Link></li>
              <li><Link to={t("common.footer.data_protection_11")} className="hover:text-primary transition-colors">{t('footer.legal.dataProtection')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Credibility Banner */}
        <div className="bg-gray-50 py-4 mt-8">
          <div className="container mx-auto text-center">
            <Shield className="h-8 w-8 inline text-primary" />
            <p className="text-lg font-semibold text-primary mt-2">{t('footer.credibility.trustedByExperts')}</p>
          </div>
        </div>

        {/* Trust Badges and Social Proof */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            {/* Family count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{t('testimonials.stats.families')} {t('testimonials.stats.familiesLabel')}</span>
            </div>
            
            {/* Trust badges */}
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {t('testimonials.compliance.gdpr')}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {t('testimonials.compliance.dataProtection')}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t('testimonials.compliance.iso')}
            </Badge>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>
        </div>
      </div>
    </footer>);

};