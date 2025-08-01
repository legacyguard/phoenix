import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Pencil, Trash2, AlertTriangle, Star, Phone, Mail, Calendar, RefreshCw, DollarSign, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COUNTRY_CONFIGS } from '@/config/countries';
import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
interface Document {
  id: string;
  name: string;
  type: string;
  countryCode: string;
  expirationDate?: string | null;
  is_key_document?: boolean;
  contract_number?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  renewal_date?: string | null;
  renewal_action?: string | null;
  importance_level?: 'critical' | 'important' | 'reference' | null;
  related_assets?: string[] | null;
  subscription_type?: 'monthly' | 'yearly' | 'one-time' | 'none' | null;
  renewal_cost?: number | null;
  auto_renewal?: boolean | null;
  provider_contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  } | null;
  cancellation_notice_period?: number | null;
}

interface DocumentCardProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
  onToggleKeyDocument?: (id: string, isKey: boolean) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit, onDelete, onToggleKeyDocument }) => {const { t: t } = useTranslation("common");
  const { t } = useTranslation('common');

  const getCountryFlag = (countryCode: string) => {
    const config = Object.values(COUNTRY_CONFIGS).find((c) => c.code === countryCode);
    return config?.flag || '🏳️';
  };

  const getExpirationStatus = () => {
    if (!document.expirationDate) return null;

    const expirationDate = new Date(document.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { status: 'expired', text: t('dashboard.expired'), variant: 'destructive' as const };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', text: t('dashboard.expiresSoon'), variant: 'secondary' as const };
    }

    return null;
  };

  const expirationStatus = getExpirationStatus();

  const getImportanceBadgeColor = (level: string | null | undefined) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'important':
        return 'default';
      case 'reference':
      default:
        return 'secondary';
    }
  };

  const hasMetadata = document.contract_number || document.contact_person ||
  document.contact_phone || document.contact_email ||
  document.renewal_date || document.renewal_action ||
  document.subscription_type && document.subscription_type !== 'none';

  return (
    <AsyncErrorBoundary>
      <Card className={cn(
        "p-3",
        document.importance_level === 'critical' && "border-destructive/50",
        document.importance_level === 'important' && "border-primary/50"
      )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{document.name}</h4>
                {document.is_key_document &&
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  }
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {document.type}
                </Badge>
                {document.importance_level &&
                  <Badge variant={getImportanceBadgeColor(document.importance_level)} className="text-xs">
                    {t(`dashboard.metadata.importance.${document.importance_level}`)}
                  </Badge>
                  }
                {expirationStatus &&
                  <Badge variant={expirationStatus.variant} className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {expirationStatus.text}
                  </Badge>
                  }
                {document.contract_number &&
                  <span className="text-xs text-muted-foreground">
                    #{document.contract_number}
                  </span>
                  }
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm">{getCountryFlag(document.countryCode)}</span>
            <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEdit(document)}>

              <Pencil className="h-3 w-3" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(document.id)}>

              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Metadata Section */}
        {hasMetadata &&
          <div className="pt-2 border-t space-y-2">
            {/* Contact Information */}
            {(document.contact_person || document.contact_phone || document.contact_email) &&
            <div className="text-xs space-y-1">
                {document.contact_person &&
              <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t('dashboard.metadata.contact')}:</span>
                    <span className="font-medium">{document.contact_person}</span>
                  </div>
              }
                {document.contact_phone &&
              <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a href={`tel:${document.contact_phone}`} className="text-primary hover:underline">
                      {document.contact_phone}
                    </a>
                  </div>
              }
                {document.contact_email &&
              <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a href={`mailto:${document.contact_email}`} className="text-primary hover:underline text-xs">
                      {document.contact_email}
                    </a>
                  </div>
              }
              </div>
            }
            
            {/* Renewal Information */}
            {(document.renewal_date || document.renewal_action) &&
            <div className="text-xs space-y-1">
                {document.renewal_date &&
              <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('dashboard.metadata.renewsOn')}:</span>
                    <span className="font-medium">{format(new Date(document.renewal_date), 'PP')}</span>
                  </div>
              }
                {document.renewal_action &&
              <div className="text-xs text-muted-foreground ml-5">
                    {document.renewal_action}
                  </div>
              }
              </div>
            }
            
            {/* Subscription Information */}
            {document.subscription_type && document.subscription_type !== 'none' &&
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {document.renewal_cost &&
                <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">€{document.renewal_cost}</span>
                      <span className="text-muted-foreground">
                        /{document.subscription_type === 'monthly' ? t('subscription.types.monthly').toLowerCase() : t('subscription.types.yearly').toLowerCase()}
                      </span>
                    </div>
                }
                  {document.auto_renewal !== null &&
                <Badge variant={document.auto_renewal ? 'default' : 'outline'} className="text-xs">
                      <RotateCw className="h-3 w-3 mr-1" />
                      {document.auto_renewal ? t('subscription.autoRenewal') : t('subscription.manual')}
                    </Badge>
                }
                </div>
                {document.cancellation_notice_period && document.cancellation_notice_period > 0 &&
              <div className="text-xs text-muted-foreground">
                    {t('subscription.cancellationNotice')}: {document.cancellation_notice_period} {t('subscription.days')}
                  </div>
              }
              </div>
            }
          </div>
          }
        
        {/* Key Document Toggle */}
        {onToggleKeyDocument &&
          <div className="flex items-center justify-between py-2 border-t">
            <Label htmlFor={`key-doc-${document.id}`} className="text-xs text-muted-foreground">{t("dashboard.documentCard.include_in_survivor_s_manual_1")}

            </Label>
            <Switch
              id={`key-doc-${document.id}`}
              checked={document.is_key_document || false}
              onCheckedChange={(checked) => onToggleKeyDocument(document.id, checked)} />

          </div>
          }
      </div>
    </Card>
    </AsyncErrorBoundary>);

};