import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Pencil, Trash2, AlertTriangle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COUNTRY_CONFIGS } from '@/config/countries';

interface Document {
  id: string;
  name: string;
  type: string;
  countryCode: string;
  expirationDate?: string | null;
  is_key_document?: boolean;
}

interface DocumentCardProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
  onToggleKeyDocument?: (id: string, isKey: boolean) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit, onDelete, onToggleKeyDocument }) => {
  const { t } = useTranslation('common');

  const getCountryFlag = (countryCode: string) => {
    const config = Object.values(COUNTRY_CONFIGS).find(c => c.code === countryCode);
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

  return (
    <Card className="p-3">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{document.name}</h4>
                {document.is_key_document && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {document.type}
                </Badge>
                {expirationStatus && (
                  <Badge variant={expirationStatus.variant} className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {expirationStatus.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm">{getCountryFlag(document.countryCode)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onEdit(document)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(document.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Key Document Toggle */}
        {onToggleKeyDocument && (
          <div className="flex items-center justify-between py-2 border-t">
            <Label htmlFor={`key-doc-${document.id}`} className="text-xs text-muted-foreground">
              Include in Survivor's Manual
            </Label>
            <Switch
              id={`key-doc-${document.id}`}
              checked={document.is_key_document || false}
              onCheckedChange={(checked) => onToggleKeyDocument(document.id, checked)}
            />
          </div>
        )}
      </div>
    </Card>
  );
};