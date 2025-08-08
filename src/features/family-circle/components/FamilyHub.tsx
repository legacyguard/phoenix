import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Clock, Send, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import FamilyPreparednessTools from '@/components/FamilyPreparednessTools';
import { PersonalAssistant } from '@/components/assistant/PersonalAssistant';
import { useAssistant } from '@/hooks/useAssistant';

// Define the access levels
type AccessLevel = 'none' | 'emergency_only' | 'limited_info' | 'full_access';

// Extend the TrustedPerson interface for this view
interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  avatarUrl?: string;
  accessLevel: AccessLevel;
  preparednessScore: number;
  lastCommunicated: string; // ISO Date string
  phone?: string;
  responsibilities?: string[];
}

export const FamilyHub: React.FC = () => {
  const { t } = useTranslation('family');
  const { getToken } = useAuth();
  const { updateEmotionalState } = useAssistant();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyProtocolEnabled, setEmergencyProtocolEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch family hub data from API
  useEffect(() => {
    const fetchFamilyHubData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getToken();
        if (!token) {
          throw new Error(t('familyHub.errors.authenticationRequired'));
        }

        const response = await fetch('/api/family-hub', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(t('familyHub.errors.failedToFetchData'));
        }

        const data = await response.json();
        setFamilyMembers(data.familyMembers);
        setEmergencyProtocolEnabled(data.emergencyProtocolEnabled);
        
        // Update emotional state based on family preparedness
        const avgPreparedness = data.familyMembers.length > 0 
          ? data.familyMembers.reduce((sum: number, member: FamilyMember) => sum + member.preparednessScore, 0) / data.familyMembers.length
          : 0;
          
        if (avgPreparedness < 40) {
          updateEmotionalState('overwhelmed');
        } else if (avgPreparedness < 60) {
          updateEmotionalState('anxious');
        } else if (avgPreparedness < 80) {
          updateEmotionalState('hopeful');
        } else {
          updateEmotionalState('confident');
        }
      } catch (error) {
        console.error('Error fetching family hub data:', error);
                const errorMessage = error instanceof Error ? error.message : t('familyHub.errors.failedToLoadMembers');
                setError(errorMessage);
                toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyHubData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  // Calculate overall family preparedness score
  const overallPreparedness = familyMembers.length > 0
    ? Math.round(familyMembers.reduce((sum, member) => sum + member.preparednessScore, 0) / familyMembers.length)
    : 0;

  const handleAccessLevelChange = async (memberId: string, newLevel: AccessLevel) => {
    // Update local state
    setFamilyMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, accessLevel: newLevel } : member
    ));

    try {
      const token = await getToken();
      if (!token) {
        throw new Error(t('familyHub.errors.authenticationRequired'));
      }

      const response = await fetch(`/api/family-hub/access-level`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberId, newLevel })
      });

      if (!response.ok) {
        throw new Error(t('familyHub.errors.failedToFetchData'));
      }

      toast.success(t('familyHub.messages.accessLevelUpdated'));
    } catch (error) {
      toast.error(t('familyHub.errors.failedToLoadMembers'));
    }
  };

  const handleSendUpdate = async (member: FamilyMember) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error(t('familyHub.errors.authenticationRequired'));
      }

      const response = await fetch(`/api/family-hub/send-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberId: member.id })
      });

      if (!response.ok) {
        throw new Error(t('familyHub.errors.failedToFetchData'));
      }

      toast.success(t('familyHub.messages.updateSentTo', { name: member.name }));
      
      // Update last communicated date
      setFamilyMembers(prev => prev.map(m => 
        m.id === member.id ? { ...m, lastCommunicated: new Date().toISOString() } : m
      ));
    } catch (error) {
      toast.error(t('familyHub.messages.failedToSendUpdate', { name: member.name }));
    }
  };

  const getAccessLevelDescription = (level: AccessLevel): string => {
    switch (level) {
      case 'none':
        return t('familyHub.accessLevels.none.description');
      case 'emergency_only':
        return t('familyHub.accessLevels.emergencyOnly.fullDescription');
      case 'limited_info':
        return t('familyHub.accessLevels.limitedInfo.fullDescription');
      case 'full_access':
        return t('familyHub.accessLevels.fullAccess.fullDescription');
      default:
        return '';
    }
  };

  const getAccessLevelColor = (level: AccessLevel): string => {
    switch (level) {
      case 'none':
        return 'text-gray-500';
      case 'emergency_only':
        return 'text-orange-600';
      case 'limited_info':
        return 'text-blue-600';
      case 'full_access':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  const getPreparednessColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysSinceContact = (lastDate: string): number => {
    const last = new Date(lastDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 font-sans max-w-screen-xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 md:w-1/3 mb-4"></div>
          <div className="h-24 md:h-32 bg-gray-200 rounded mb-4 md:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="h-40 md:h-48 bg-gray-200 rounded"></div>
            <div className="h-40 md:h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">{t('familyHub.title')}</h1>
      <p className="text-lg text-gray-600 mt-1">{t('familyHub.subtitle')}</p>

      <Tabs defaultValue="members" className="mt-4 md:mt-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="members" className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-4 text-xs md:text-sm">
            <Users className="w-4 h-4" />
          <span className="hidden sm:inline">{t('familyHub.tabs.familyMembers')}</span>
          <span className="sm:hidden">{t('familyHub.tabs.members')}</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-4 text-xs md:text-sm">
            <Wrench className="w-4 h-4" />
          <span className="hidden sm:inline">{t('familyHub.tabs.preparednessTools')}</span>
          <span className="sm:hidden">{t('familyHub.tabs.tools')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          {/* Overall Family Preparedness */}
          <Card>
            <CardContent className="text-center p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2">
                <Users className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
                <CardTitle className="text-lg md:text-xl">{t('familyHub.overallPreparedness.title')}</CardTitle>
              </div>
              <div className="relative inline-flex items-center justify-center">
                <Progress value={overallPreparedness} className="w-32 md:w-48 h-32 md:h-48 rounded-full" />
                <div className="absolute">
                  <p className={`text-3xl md:text-5xl font-bold ${getPreparednessColor(overallPreparedness)}`}>
                    {overallPreparedness}%
                  </p>
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 px-4">
                {t('familyHub.overallPreparedness.description')}
              </p>
              {overallPreparedness < 70 && (
                <Alert className="mt-3 md:mt-4 bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-xs md:text-sm text-yellow-800">
                    {t('familyHub.overallPreparedness.improvementNeeded')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Emergency Protocol Configuration */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <CardTitle className="text-base md:text-lg">{t('familyHub.emergencyProtocol.title')}</CardTitle>
                </div>
                <Button 
                  variant={emergencyProtocolEnabled ? "default" : "outline"}
                  size="sm"
                  className="w-full sm:w-auto py-2"
                  onClick={() => setEmergencyProtocolEnabled(!emergencyProtocolEnabled)}
                >
                  {emergencyProtocolEnabled ? t('familyHub.emergencyProtocol.configured') : t('familyHub.emergencyProtocol.configure')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <p className="text-xs md:text-sm text-gray-600">
                {t('familyHub.emergencyProtocol.description')}
              </p>
              {emergencyProtocolEnabled && (
                <div className="mt-3 p-2 md:p-3 bg-green-50 rounded-lg">
                  <p className="text-xs md:text-sm text-green-800 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    {t('familyHub.emergencyProtocol.activeMessage')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Management */}
          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold flex items-center mb-4">
              <Users className="w-5 h-5 mr-2" />
              {t('familyHub.memberManagement.title')}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {familyMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <Avatar className="h-10 md:h-12 w-10 md:w-12 flex-shrink-0">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback className="text-xs md:text-sm">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 min-w-0">
                          <CardTitle className="text-base md:text-lg truncate">{member.name}</CardTitle>
                          <p className="text-xs md:text-sm text-gray-500">{member.relationship}</p>
                        </div>
                      </div>
                      {getDaysSinceContact(member.lastCommunicated) > 30 && (
                        <div className="text-orange-500 ml-2" title={t('familyHub.memberManagement.lastContactOver30Days')}>
                          <Clock className="w-4 md:w-5 h-4 md:h-5" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div>
                      <Label htmlFor={`access-${member.id}`} className="text-sm md:text-base">{t('familyHub.memberManagement.informationAccessLevel')}</Label>
                      <Select 
                        value={member.accessLevel}
                        onValueChange={(value) => handleAccessLevelChange(member.id, value as AccessLevel)}
                      >
                        <SelectTrigger id={`access-${member.id}`} className="mt-1 h-10 md:h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="py-3">
                            <div>
                              <p className="font-medium text-sm">{t('familyHub.accessLevels.none.title')}</p>
                  <p className="text-xs text-gray-500">{t('familyHub.accessLevels.none.description')}</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="emergency_only" className="py-3">
                            <div>
                              <p className="font-medium text-sm">{t('familyHub.accessLevels.emergencyOnly.title')}</p>
                  <p className="text-xs text-gray-500">{t('familyHub.accessLevels.emergencyOnly.description')}</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="limited_info" className="py-3">
                            <div>
                              <p className="font-medium text-sm">{t('familyHub.accessLevels.limitedInfo.title')}</p>
                  <p className="text-xs text-gray-500">{t('familyHub.accessLevels.limitedInfo.description')}</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="full_access" className="py-3">
                            <div>
                              <p className="font-medium text-sm">{t('familyHub.accessLevels.fullAccess.title')}</p>
                  <p className="text-xs text-gray-500">{t('familyHub.accessLevels.fullAccess.description')}</p>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className={`text-xs mt-1 ${getAccessLevelColor(member.accessLevel)}`}>
                        {getAccessLevelDescription(member.accessLevel)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-gray-600">{t('familyHub.memberManagement.preparedness')}</span>
                        <span className={`text-xs md:text-sm font-bold ${getPreparednessColor(member.preparednessScore)}`}>
                          {member.preparednessScore}%
                        </span>
                      </div>
                      <Progress value={member.preparednessScore} className="h-2" />
                    </div>

                    <div className="pt-3 md:pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-3">
                        {t('familyHub.memberManagement.lastContacted')}: {new Date(member.lastCommunicated).toLocaleDateString()} 
                        ({t('familyHub.memberManagement.daysAgo', { days: getDaysSinceContact(member.lastCommunicated) })})
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full py-2.5 md:py-2 text-sm"
                        onClick={() => handleSendUpdate(member)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">{t('familyHub.memberManagement.sendUpdateTo', { name: member.name.split(' ')[0] })}</span>
                        <span className="sm:hidden">{t('familyHub.memberManagement.sendUpdate')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New Trusted Person */}
            <Card className="mt-4 md:mt-6 border-dashed">
              <CardContent className="text-center py-6 md:py-8">
                <Users className="w-10 md:w-12 h-10 md:h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm md:text-base text-gray-600 mb-3 px-4">{t('familyHub.memberManagement.addMorePeople')}</p>
                <Button className="py-2.5 px-6">{t('familyHub.memberManagement.addTrustedPerson')}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="mt-6">
          <FamilyPreparednessTools />
        </TabsContent>
      </Tabs>
      
      {/* Personal Assistant */}
      {!loading && (
        <PersonalAssistant 
          currentPage="family"
          contextData={{
            familyMemberCount: familyMembers.length,
            overallPreparedness,
            emergencyProtocolEnabled,
            membersNeedingAttention: familyMembers.filter(m => 
              getDaysSinceContact(m.lastCommunicated) > 30 || m.preparednessScore < 50
            ).length
          }}
        />
      )}
    </div>
  );
};

export default FamilyHub;
