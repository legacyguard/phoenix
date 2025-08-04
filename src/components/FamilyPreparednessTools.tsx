import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Map, BookOpen, Video, Printer, Download, Lock, Crown } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

interface PreparednessTool {
  id: 'simulator' | 'treasure_hunt' | 'guides' | 'video_messages';
  title: string;
  description: string;
  icon: React.ReactNode;
  targetUser: 'user' | 'family_member'; // Who is this tool for?
}

interface GuideScenario {
  id: string;
  title: string;
  description: string;
}



const FamilyPreparednessTools: React.FC = () => {
  const { t } = useTranslation('family');
  const { getToken } = useAuth();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [generatedGuide, setGeneratedGuide] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { isPremium } = useSubscription();

  const guideScenarios: GuideScenario[] = [
    {
      id: 'death',
      title: t("familyPreparednessTools.scenarios.death.title"),
      description: t("familyPreparednessTools.scenarios.death.description")
    },
    {
      id: 'hospitalization',
      title: t("familyPreparednessTools.scenarios.hospitalization.title"),
      description: t("familyPreparednessTools.scenarios.hospitalization.description")
    },
    {
      id: 'missing',
      title: t("familyPreparednessTools.scenarios.missing.title"),
      description: t("familyPreparednessTools.scenarios.missing.description")
    },
    {
      id: 'emergency',
      title: t("familyPreparednessTools.scenarios.emergency.title"),
      description: t("familyPreparednessTools.scenarios.emergency.description")
    }
  ];

  const handleToolClick = (toolId: string) => {
    if (!isPremium) {
      toast.error(t("familyPreparednessTools.errors.premiumRequired"));
      return;
    }

    switch (toolId) {
      case 'guides':
        setShowGuideModal(true);
        break;
      default:
        toast.info(`${toolId} ${t("familyPreparednessTools.errors.comingSoon")}`);
    }
  };

  const generateGuide = async () => {
    if (!selectedScenario) {
      toast.error(t("familyPreparednessTools.errors.selectScenario"));
      return;
    }

    setIsGenerating(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // For now, we'll generate a mock guide. In production, this would fetch user data
      // and generate a personalized guide
      const guide = generateMockGuide(selectedScenario);
      setGeneratedGuide(guide);
    } catch (error) {
      console.error('Error generating guide:', error);
      toast.error(t("familyPreparednessTools.errors.generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockGuide = (scenario: string) => {
    const scenarioData = guideScenarios.find((s) => s.id === scenario);
    if (!scenarioData) return '';

    // This is a mock implementation. In production, this would use actual user data
    const guides: Record<string, string> = {
      death: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${t("familyPreparednessTools.guides.death.title")}</h1>
          <p style="color: #6b7280; margin-top: 10px;">${t("familyPreparednessTools.guides.death.generatedOn")} ${new Date().toLocaleDateString()}</p>
          
          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.death.first24Hours")}</h2>
          <ol style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.death.contactExecutor")}</strong>
              <ul style="margin-top: 5px;">
                <li>Name: John Smith</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: john.smith@email.com</li>
              </ul>
            </li>
            <li><strong>${t("familyPreparednessTools.guides.death.contactLawyer")}</strong>
              <ul style="margin-top: 5px;">
                <li>Firm: Davis & Associates</li>
                <li>Attorney: Sarah Davis</li>
                <li>Phone: (555) 789-1011</li>
                <li>Address: 123 Legal Street, Suite 100</li>
              </ul>
            </li>
            <li><strong>${t("familyPreparednessTools.guides.death.locateWill")}</strong>
              <ul style="margin-top: 5px;">
                <li>Location: Safe deposit box at Main Street Bank</li>
                <li>Box Number: 12345</li>
                <li>Key Location: Top drawer of home office desk</li>
              </ul>
            </li>
            <li><strong>${t("familyPreparednessTools.guides.death.secureResidence")}</strong>
              <ul style="margin-top: 5px;">
                <li>Spare key: Under the planter on the back porch</li>
                <li>Alarm code: [Contact executor for code]</li>
                <li>Utilities account numbers are in the filing cabinet</li>
              </ul>
            </li>
          </ol>

          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.death.importantDocuments")}</h2>
          <ul style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.death.deathCertificate")}</strong> Order at least 10 copies</li>
            <li><strong>${t("familyPreparednessTools.mockContent.insurancePolicies")}:</strong> Filed in "Insurance" folder in filing cabinet</li>
            <li><strong>${t("familyPreparednessTools.guides.death.bankAccounts")}:</strong> List in the safe with account numbers</li>
            <li><strong>${t("familyPreparednessTools.guides.death.investmentAccounts")}:</strong> Contact financial advisor: Mark Johnson (555) 222-3333</li>
          </ul>

          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.death.peopleToNotify")}</h2>
          <ul style="line-height: 1.8;">
            <li>${t("familyPreparednessTools.guides.death.employer")}: HR Department (555) 444-5555</li>
            <li>${t("familyPreparednessTools.guides.death.insuranceCompanies")}: See folder for complete list</li>
            <li>${t("familyPreparednessTools.guides.death.financialInstitutions")}: List in safe</li>
            <li>${t("familyPreparednessTools.guides.death.socialSecurity")}: 1-800-772-1213</li>
          </ul>

          <div style="margin-top: 40px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; font-style: italic;">${t("familyPreparednessTools.guides.death.disclaimer")}</p>
          </div>
        </div>
      `,
      hospitalization: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${t("familyPreparednessTools.guides.hospitalization.title")}</h1>
          <p style="color: #6b7280; margin-top: 10px;">${t("familyPreparednessTools.guides.death.generatedOn")} ${new Date().toLocaleDateString()}</p>
          
          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.hospitalization.medicalInformation")}</h2>
          <ul style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.primaryCarePhysician")}</strong> Dr. Emily Chen - (555) 111-2222</li>
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.preferredHospital")}</strong> City General Hospital</li>
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.bloodType")}</strong> O+</li>
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.allergies")}</strong> Penicillin, shellfish</li>
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.currentMedications")}</strong> List in medicine cabinet</li>
          </ul>

          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.hospitalization.emergencyContacts")}</h2>
          <ol style="line-height: 1.8;">
            <li>Spouse: Jane Doe - (555) 333-4444</li>
            <li>Adult Child: Michael Doe - (555) 555-6666</li>
            <li>Sibling: Sarah Johnson - (555) 777-8888</li>
          </ol>

          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.hospitalization.legalDocuments")}</h2>
          <ul style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.healthcarePowerOfAttorney")}</strong> Jane Doe</li>
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.livingWill")}</strong> On file at hospital and with attorney</li>
            <li><strong>${t("familyPreparednessTools.guides.hospitalization.hipaaRelease")}</strong> Signed for immediate family members</li>
          </ul>
        </div>
      `,
      missing: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${t("familyPreparednessTools.guides.missing.title")}</h1>
          <p style="color: #6b7280; margin-top: 10px;">${t("familyPreparednessTools.guides.death.generatedOn")} ${new Date().toLocaleDateString()}</p>
          
          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.missing.immediateActions")}</h2>
          <ol style="line-height: 1.8;">
            <li>${t("familyPreparednessTools.guides.missing.contactLocalPolice")}</li>
            <li>${t("familyPreparednessTools.guides.missing.checkWithWorkplace")} (555) 444-5555</li>
            <li>${t("familyPreparednessTools.guides.missing.contactCloseFriends")}</li>
            <li>${t("familyPreparednessTools.guides.missing.checkHospitals")}</li>
          </ol>

          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.missing.digitalFootprint")}</h2>
          <ul style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.missing.phoneProvider")}</strong> Verizon - Account #12345678</li>
            <li><strong>${t("familyPreparednessTools.guides.missing.email")}</strong> Primary email passwords in password manager</li>
            <li><strong>${t("familyPreparednessTools.guides.missing.socialMedia")}</strong> Active on Facebook and LinkedIn</li>
            <li><strong>${t("familyPreparednessTools.guides.missing.bankingApps")}</strong> Check for recent transactions</li>
          </ul>
        </div>
      `,
      emergency: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${t("familyPreparednessTools.guides.emergency.title")}</h1>
          <p style="color: #6b7280; margin-top: 10px;">${t("familyPreparednessTools.guides.death.generatedOn")} ${new Date().toLocaleDateString()}</p>
          
          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.emergency.keyContacts")}</h2>
          <ul style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.emergency.emergency")}</strong> 911</li>
            <li><strong>${t("familyPreparednessTools.guides.emergency.spouse")}</strong> Jane Doe - (555) 333-4444</li>
            <li><strong>${t("familyPreparednessTools.guides.emergency.attorney")}</strong> Sarah Davis - (555) 789-1011</li>
            <li><strong>${t("familyPreparednessTools.guides.emergency.financialAdvisor")}</strong> Mark Johnson - (555) 222-3333</li>
            <li><strong>${t("familyPreparednessTools.guides.emergency.insuranceAgent")}</strong> Tom Wilson - (555) 999-0000</li>
          </ul>

          <h2 style="color: #374151; margin-top: 30px;">${t("familyPreparednessTools.guides.emergency.homeInformation")}</h2>
          <ul style="line-height: 1.8;">
            <li><strong>${t("familyPreparednessTools.guides.emergency.address")}</strong> 123 Main Street, Anytown, ST 12345</li>
            <li><strong>${t("familyPreparednessTools.guides.emergency.securitySystem")}</strong> ADT - (800) 123-4567</li>
            <li><strong>${t("familyPreparednessTools.guides.emergency.utilities")}</strong> Account numbers in filing cabinet</li>
          </ul>
        </div>
      `
    };

    return guides[scenario] || '<p>Guide not available for this scenario.</p>';
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Emergency Guide</title>
            <style>
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${generatedGuide}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const tools: PreparednessTool[] = [
  {
    id: 'simulator',
    title: t("familyPreparednessTools.tools.emergencySimulator"),
    description: t("familyPreparednessTools.tools.emergencySimulatorDesc"),
    icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
    targetUser: 'user'
  },
  {
    id: 'treasure_hunt',
    title: t("familyPreparednessTools.tools.informationTreasureHunt"),
    description: t("familyPreparednessTools.tools.treasureHuntDesc"),
    icon: <Map className="w-8 h-8 text-blue-600" />,
    targetUser: 'family_member'
  },
  {
    id: 'guides',
    title: t("familyPreparednessTools.tools.stepByStepGuides"),
    description: t("familyPreparednessTools.tools.stepByStepGuidesDesc"),
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    targetUser: 'user'
  },
  {
    id: 'video_messages',
    title: t("familyPreparednessTools.tools.videoMessages"),
    description: t("familyPreparednessTools.tools.videoMessagesDesc"),
    icon: <Video className="w-8 h-8 text-purple-600" />,
    targetUser: 'user'
  }];


  // Component JSX will go here
  return (
    <div>
      <p className="text-gray-600 mb-6">{t("familyPreparednessTools.use_these_tools_to_ensure_your_1")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) =>
        <Card key={tool.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center">
                <div className="mr-4">{tool.icon}</div>
                <CardTitle>{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-700">{tool.description}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleToolClick(tool.id)}>{t("familyPreparednessTools.tools.launch")} {tool.title}</Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Step-by-Step Guide Generator Modal */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("familyPreparednessTools.generate_emergency_guide_2")}</DialogTitle>
            <DialogDescription>{t("familyPreparednessTools.create_a_printable_guide_for_y_3")}

            </DialogDescription>
          </DialogHeader>

          {!generatedGuide ?
          <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="scenario-select">{t("familyPreparednessTools.select_scenario_4")}</Label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger id="scenario-select" className="w-full mt-2">
                    <SelectValue placeholder={t('familyPreparednessTools.tools.chooseScenario')} />
                  </SelectTrigger>
                  <SelectContent>
                    {guideScenarios.map((scenario) =>
                  <SelectItem key={scenario.id} value={scenario.id}>
                        <div>
                          <p className="font-medium">{scenario.title}</p>
                          <p className="text-xs text-gray-500">{scenario.description}</p>
                        </div>
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGuideModal(false)}>
                  {t('familyPreparednessTools.tools.cancel')}
                </Button>
                <Button onClick={generateGuide} disabled={isGenerating}>
                  {isGenerating ? t('familyPreparednessTools.tools.generating') : t('familyPreparednessTools.tools.generateGuide')}
                </Button>
              </DialogFooter>
            </div> :

          <div>
              <div
              className="border rounded-lg p-4 bg-white my-4"
              dangerouslySetInnerHTML={{ __html: generatedGuide }} />

              
              <DialogFooter className="flex gap-2">
                <Button
                variant="outline"
                onClick={() => {
                  setGeneratedGuide('');
                  setSelectedScenario('');
                }}>{t("familyPreparednessTools.generate_another_5")}


              </Button>
                <Button onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  {t('familyPreparednessTools.tools.printGuide')}
                </Button>
              </DialogFooter>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

};

export default FamilyPreparednessTools;