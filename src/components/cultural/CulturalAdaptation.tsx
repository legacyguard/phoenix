import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Globe,
  Heart,
  Users,
  BookOpen,
  Star,
  Info,
  ChevronRight,
  Sparkles,
  Shield,
  Calendar
} from 'lucide-react';
import type { CulturalContext } from '@/services/familySituationAnalysis';
import { useToast } from '@/components/ui/use-toast';

interface CulturalOption {
  id: string;
  title: string;
  description: string;
  category: 'religious' | 'traditional' | 'legal' | 'family';
  isSelected?: boolean;
  details?: string;
}

interface CulturalAdaptationProps {
  culturalContext: CulturalContext;
  onUpdate?: (context: CulturalContext) => void;
  onComplete?: () => void;
}

const culturalOptions: CulturalOption[] = [
  // Religious Considerations
  {
    id: 'islamic_inheritance',
    title: 'Islamic Inheritance Laws',
    description: 'Follow Sharia-compliant distribution guidelines while meeting legal requirements',
    category: 'religious',
    details: 'We can help structure your planning to honor Islamic inheritance principles while ensuring legal validity in your jurisdiction.'
  },
  {
    id: 'jewish_traditions',
    title: 'Jewish Traditions',
    description: 'Incorporate Jewish customs and ethical will considerations',
    category: 'religious',
    details: "Include ethical wills (tzava'ah) and honor traditions around inheritance and family obligations."
  },
  {
    id: 'christian_values',
    title: 'Christian Values',
    description: 'Reflect Christian principles of stewardship and charity',
    category: 'religious',
    details: 'Consider tithing, charitable giving, and values-based distribution in your planning.'
  },
  {
    id: 'buddhist_principles',
    title: 'Buddhist Principles',
    description: 'Honor Buddhist concepts of impermanence and compassion',
    category: 'religious',
    details: 'Focus on mindful giving and reducing attachment while protecting loved ones.'
  },
  
  // Traditional/Cultural Practices
  {
    id: 'filial_piety',
    title: 'Filial Piety',
    description: 'Honor traditional obligations to care for elderly parents',
    category: 'traditional',
    details: 'Ensure your planning reflects the cultural importance of caring for elders.'
  },
  {
    id: 'collective_family',
    title: 'Collective Family Decision-Making',
    description: 'Involve extended family in important decisions',
    category: 'traditional',
    details: 'Create mechanisms for family consultation while maintaining legal clarity.'
  },
  {
    id: 'ancestral_property',
    title: 'Ancestral Property Traditions',
    description: 'Maintain family property through generations',
    category: 'traditional',
    details: 'Structure ownership to keep important property within the family line.'
  },
  {
    id: 'gender_customs',
    title: 'Traditional Gender Roles',
    description: 'Balance traditional expectations with legal requirements',
    category: 'traditional',
    details: 'Navigate cultural expectations while ensuring fair and legal distribution.'
  },
  
  // Family Structure
  {
    id: 'extended_family',
    title: 'Extended Family Obligations',
    description: 'Include provisions for extended family members',
    category: 'family',
    details: 'Consider nephews, nieces, and other relatives in your planning.'
  },
  {
    id: 'multi_cultural',
    title: 'Multi-Cultural Family',
    description: 'Honor multiple cultural traditions within one family',
    category: 'family',
    details: 'Blend different cultural expectations harmoniously in your planning.'
  },
  {
    id: 'immigrant_family',
    title: 'Immigrant Family Considerations',
    description: 'Address assets and family across multiple countries',
    category: 'family',
    details: 'Navigate international estate planning and family obligations.'
  },
  
  // Legal Adaptations
  {
    id: 'tribal_law',
    title: 'Tribal Law Considerations',
    description: 'Coordinate with tribal legal systems',
    category: 'legal',
    details: 'Ensure planning works within both tribal and state/federal law.'
  },
  {
    id: 'civil_law',
    title: 'Civil Law Traditions',
    description: 'Adapt to civil law inheritance requirements',
    category: 'legal',
    details: 'Work within forced heirship and other civil law requirements.'
  }
];

export const CulturalAdaptation: React.FC<CulturalAdaptationProps> = ({
  culturalContext,
  onUpdate,
  onComplete
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set([
      ...(culturalContext.religiousConsiderations || []),
      ...(culturalContext.traditions || [])
    ])
  );
  const [activeTab, setActiveTab] = useState<string>('religious');

  const handleOptionToggle = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const handleSave = () => {
    const religious = culturalOptions
      .filter(opt => opt.category === 'religious' && selectedOptions.has(opt.id))
      .map(opt => opt.id);
    
    const traditions = culturalOptions
      .filter(opt => opt.category === 'traditional' && selectedOptions.has(opt.id))
      .map(opt => opt.id);

    const updatedContext: CulturalContext = {
      ...culturalContext,
      religiousConsiderations: religious,
      traditions: traditions
    };

    onUpdate?.(updatedContext);
    
    toast({
      title: t('cultural.saved'),
      description: t('cultural.savedDesc'),
    });

    onComplete?.();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'religious':
        return <BookOpen className="h-5 w-5" />;
      case 'traditional':
        return <Star className="h-5 w-5" />;
      case 'family':
        return <Users className="h-5 w-5" />;
      case 'legal':
        return <Shield className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>{t('cultural.title')}</CardTitle>
              <CardDescription>{t('cultural.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              {t('cultural.respectMessage')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cultural Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('cultural.selectConsiderations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="religious">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('cultural.religious')}
              </TabsTrigger>
              <TabsTrigger value="traditional">
                <Star className="h-4 w-4 mr-2" />
                {t('cultural.traditional')}
              </TabsTrigger>
              <TabsTrigger value="family">
                <Users className="h-4 w-4 mr-2" />
                {t('cultural.family')}
              </TabsTrigger>
              <TabsTrigger value="legal">
                <Shield className="h-4 w-4 mr-2" />
                {t('cultural.legal')}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              {['religious', 'traditional', 'family', 'legal'].map(category => (
                <TabsContent key={category} value={category} className="space-y-3">
                  {culturalOptions
                    .filter(opt => opt.category === category)
                    .map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedOptions.has(option.id) 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => handleOptionToggle(option.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedOptions.has(option.id)}
                                onCheckedChange={() => handleOptionToggle(option.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getCategoryIcon(option.category)}
                                  <h4 className="font-medium">{option.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {option.description}
                                </p>
                                {option.details && selectedOptions.has(option.id) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 p-3 bg-white rounded-lg border"
                                  >
                                    <div className="flex items-start gap-2">
                                      <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-gray-700">{option.details}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {selectedOptions.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t('cultural.selectedSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedOptions).map(id => {
                const option = culturalOptions.find(opt => opt.id === id);
                if (!option) return null;
                return (
                  <Badge key={id} variant="secondary" className="px-3 py-1">
                    {getCategoryIcon(option.category)}
                    <span className="ml-1">{option.title}</span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setSelectedOptions(new Set())}>
          {t('cultural.clearAll')}
        </Button>
        <Button onClick={handleSave} disabled={selectedOptions.size === 0}>
          {t('cultural.savePreferences')}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
