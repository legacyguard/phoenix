import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Trash2, Mail } from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/config/countries';

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
}

export const GuardianCard: React.FC<GuardianCardProps> = ({
  guardian,
  onEdit,
  onDelete,
  onSendInvite
}) => {
  const countryConfig = Object.values(COUNTRY_CONFIGS).find(
    config => config.code === guardian.country_code
  );

  return (
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
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(guardian.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Country */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Country:</span>
            {countryConfig && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">{countryConfig.flag}</span>
                <span className="text-sm text-muted-foreground">{countryConfig.name}</span>
              </div>
            )}
          </div>
          
          {/* Roles */}
          {guardian.roles && guardian.roles.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Roles:</span>
              <div className="flex flex-wrap gap-1">
                {guardian.roles.map((role, index) => (
                  <Badge key={index} variant="heritage" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Invitation Status */}
          <div className="flex items-center justify-between pt-2">
            {guardian.invitation_status === 'sent' ? (
              <Badge variant="secondary" className="text-xs">
                Invitation Sent
              </Badge>
            ) : guardian.invitation_status === 'accepted' ? (
              <Badge variant="heritage" className="text-xs">
                Accepted
              </Badge>
            ) : guardian.invitation_status === 'declined' ? (
              <Badge variant="destructive" className="text-xs">
                Declined
              </Badge>
            ) : (
              onSendInvite && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendInvite(guardian)}
                  className="text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Send Invite
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};