import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Trash2, Mail, BookOpen, CheckCircle } from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/config/countries';
import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { useTranslation } from 'react-i18next';

interface GuardianCardProps {
  guardian: {
    id: string;
    full_name: string;
    relationship: string;
    country_code: string;
    roles: string[];
    invitation_status?: string;
    invitation_email?: string;
  };
  onEdit: (guardian: any) => void;
  onDelete: (id: string) => void;
  onSendInvite?: (guardian: any) => void;
  onCreatePlaybook?: (guardian: any) => void;
}

export const GuardianCard: React.FC<GuardianCardProps> = ({
  guardian,
  onEdit,
  onDelete,
  onSendInvite,
  onCreatePlaybook
}) => {const { t: t } = useTranslation("common");
  const { t } = useTranslation('common');
  const [playbookStatus, setPlaybookStatus] = useState<'empty' | 'draft' | 'complete' | null>(null);

  const countryConfig = Object.values(COUNTRY_CONFIGS).find(
    (config) => config.code === guardian.country_code
  );

  // Check playbook status
  useEffect(() => {
    const checkPlaybookStatus = async () => {
      try {
        const { data } = await supabaseWithRetry.
        from('guardian_playbooks').
        select('status').
        eq('guardian_id', guardian.id).
        single();

        if (data) {
          setPlaybookStatus(data.status);
        }
      } catch (error) {
        // No playbook exists
        setPlaybookStatus('empty');
      }
    };

    checkPlaybookStatus();
  }, [guardian.id]);

  return (
    <AsyncErrorBoundary>
      <Card variant="heritage" className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-primary">
                {guardian.full_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {guardian.relationship}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(guardian)}
                className="h-8 w-8 p-0">

              <Edit className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(guardian.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive">

              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Country */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{t("dashboard.guardianCard.country_1")}</span>
            {countryConfig &&
              <div className="flex items-center space-x-1">
                <span className="text-sm">{countryConfig.flag}</span>
                <span className="text-sm text-muted-foreground">{countryConfig.name}</span>
              </div>
              }
          </div>
          
          {/* Roles */}
          {guardian.roles && guardian.roles.length > 0 &&
            <div className="space-y-2">
              <span className="text-sm font-medium">{t("dashboard.guardianCard.roles_2")}</span>
              <div className="flex flex-wrap gap-1">
                {guardian.roles.map((role, index) =>
                <Badge key={index} variant="heritage" className="text-xs">
                    {role}
                  </Badge>
                )}
              </div>
            </div>
            }
          
          {/* Playbook Status */}
          {onCreatePlaybook &&
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('playbook.label')}:</span>
                {playbookStatus === 'complete' ?
                <Badge variant="default" className="text-xs gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t('playbook.status.complete')}
                  </Badge> :
                playbookStatus === 'draft' ?
                <Badge variant="secondary" className="text-xs">
                    {t('playbook.status.draft')}
                  </Badge> :

                <Badge variant="outline" className="text-xs">
                    {t('playbook.status.empty')}
                  </Badge>
                }
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreatePlaybook(guardian)}
                className="text-xs">

                <BookOpen className="h-3 w-3 mr-1" />
                {playbookStatus === 'empty' ? t('playbook.create') : t('playbook.edit')}
              </Button>
            </div>
            }
          
          {/* Invitation Status */}
          <div className="flex items-center justify-between pt-2">
            {guardian.invitation_status === 'sent' ?
              <Badge variant="secondary" className="text-xs">
                {t('guardian.invitationSent')}
              </Badge> :
              guardian.invitation_status === 'accepted' ?
              <Badge variant="heritage" className="text-xs">
                {t('guardian.accepted')}
              </Badge> :
              guardian.invitation_status === 'declined' ?
              <Badge variant="destructive" className="text-xs">
                {t('guardian.declined')}
              </Badge> :

              onSendInvite &&
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendInvite(guardian)}
                className="text-xs">

                  <Mail className="h-3 w-3 mr-1" />
                  {t('guardian.sendInvite')}
                </Button>

              }
          </div>
        </div>
      </CardContent>
    </Card>
    </AsyncErrorBoundary>);

};