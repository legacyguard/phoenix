import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FileText, Printer } from 'lucide-react';

// Define the structure for a single scenario
import { useTranslation } from "react-i18next";interface Scenario {
  id: 'hospitalized' | 'incapacitated' | 'sudden_passing';
  title: string; // e.g., "What if you were in the hospital for 3 months?"
  description: string; // A brief, empathetic description of the situation.
  icon: React.ReactNode; // An icon representing the scenario.
}

// Define the structure for action steps with vulnerability focus
interface TimelineEvent {
  timeframe: "First 24 Hours" | "First Week" | "First Month" | "3-6 Months";
  title: string;
  description: string;
  responsiblePersonId?: string;
}

interface ActionStep {
  id: string;
  vulnerability: string; // "Family can't access bank accounts"
  actionTitle: string; // "Grant spouse access to your primary account"
  estimatedTime: string; // "10 minutes"
  impactStatement: string; // "Completing this ensures your family can pay bills and manage daily expenses without delay."
  isCompleted: boolean;
}

// Define the structure for the analysis of a scenario's impact
interface ScenarioImpactAnalysis {
  scenarioId: Scenario['id'];
  preparednessLevel: number; // 0-100, based on user's current data
  vulnerabilities: {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
  }[];
  mitigationPlan: ActionStep[];
}

const ScenarioPlanner: React.FC = () => {
  const { t } = useTranslation();
  
  // Mock data for now; this will come from a central store later.
  const scenarios: Scenario[] = [
  {
    id: 'hospitalized',
    title: t("scenarioPlanner.scenarios.hospitalized.title"),
    description: t("scenarioPlanner.scenarios.hospitalized.description"),
    icon: <HospitalIcon /> // Placeholder for an actual icon
  },
  {
    id: 'incapacitated',
    title: t("scenarioPlanner.scenarios.incapacitated.title"),
    description: t("scenarioPlanner.scenarios.incapacitated.description"),
    icon: <IncapacityIcon /> // Placeholder
  },
  {
    id: 'sudden_passing',
    title: t("scenarioPlanner.scenarios.suddenPassing.title"),
    description: t("scenarioPlanner.scenarios.suddenPassing.description"),
    icon: <HeartbreakIcon /> // Placeholder
  }];


  const [activeScenario, setActiveScenario] = useState<Scenario['id']>('hospitalized');
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');

  // This function will later fetch real analysis based on user data.
  const getImpactAnalysis = (scenarioId: Scenario['id']): ScenarioImpactAnalysis => {
    // MOCK DATA
    if (scenarioId === 'hospitalized') {
      return {
        scenarioId: 'hospitalized',
        preparednessLevel: 45,
        vulnerabilities: [
        { title: t("scenarioPlanner.vulnerabilities.billsGoUnpaid"), description: t("scenarioPlanner.descriptions.billsGoUnpaid"), severity: 'critical' },
        { title: t("scenarioPlanner.vulnerabilities.businessDecisionsStall"), description: t("scenarioPlanner.descriptions.businessDecisionsStall"), severity: 'high' }],

        mitigationPlan: [
        {
          id: 'poa-finance',
          vulnerability: t("scenarioPlanner.vulnerabilities.familyCannotManageFinances"),
          actionTitle: t("scenarioPlanner.actions.designatePowerOfAttorney"),
          estimatedTime: "30 minutes",
          impactStatement: t("scenarioPlanner.descriptions.familyCannotManageFinances"),
          isCompleted: false
        },
        {
          id: 'bank-access',
          vulnerability: t("scenarioPlanner.vulnerabilities.familyCannotAccessBankAccount"),
          actionTitle: t("scenarioPlanner.actions.grantSpouseAccess"),
          estimatedTime: "10 minutes",
          impactStatement: t("scenarioPlanner.descriptions.familyCannotAccessBankAccount"),
          isCompleted: true
        },
        {
          id: 'business-continuity',
          vulnerability: t("scenarioPlanner.vulnerabilities.businessNoLeadership"),
          actionTitle: t("scenarioPlanner.actions.createBusinessContinuityPlan"),
          estimatedTime: "25 minutes",
          impactStatement: t("scenarioPlanner.descriptions.businessNoLeadership"),
          isCompleted: false
        }]

      };
    }

    if (scenarioId === 'sudden_passing') {
      return {
        scenarioId: 'sudden_passing',
        preparednessLevel: 60,
        vulnerabilities: [
        { title: t("scenarioPlanner.vulnerabilities.noWillFound"), description: t("scenarioPlanner.descriptions.noWillFound"), severity: 'critical' },
        { title: t("scenarioPlanner.vulnerabilities.insuranceDetailsUnknown"), description: t("scenarioPlanner.descriptions.insuranceDetailsUnknown"), severity: 'high' }],

        mitigationPlan: [
        {
          id: 'create-will',
          vulnerability: t("scenarioPlanner.vulnerabilities.noWillAvailable"),
          actionTitle: t("scenarioPlanner.actions.draftWill"),
          estimatedTime: "1 hour",
          impactStatement: "Ensures that your assets are distributed according to your wishes, avoiding lengthy legal processes.",
          isCompleted: false
        },
        {
          id: 'insurance-info',
          vulnerability: t("scenarioPlanner.vulnerabilities.unknownLifeInsurance"),
          actionTitle: t("scenarioPlanner.actions.compileInsuranceList"),
          estimatedTime: "45 minutes",
          impactStatement: "Provides quick access to beneficiaries, ensuring timely claim processing.",
          isCompleted: false
        }]

      };
    }

    // Return mock data for other scenarios...
    return { scenarioId: 'incapacitated', preparednessLevel: 0, vulnerabilities: [], mitigationPlan: [] };
  };

  const analysis = getImpactAnalysis(activeScenario);
  
  // Mock function to get timeline events
  const getTimelineEvents = (scenarioId: Scenario['id']): TimelineEvent[] => {
    if (scenarioId === 'sudden_passing') {
      return [
      { timeframe: t("scenarioPlanner.timeframes.first24Hours"), title: t("scenarioPlanner.timelineEvents.notifyImmediateFamily"), description: t("scenarioPlanner.descriptions.notifyImmediateFamily") },
      { timeframe: t("scenarioPlanner.timeframes.first24Hours"), title: t("scenarioPlanner.timelineEvents.securePhysicalProperty"), description: t("scenarioPlanner.descriptions.securePhysicalProperty") },
      { timeframe: t("scenarioPlanner.timeframes.firstWeek"), title: t("scenarioPlanner.timelineEvents.contactExecutor"), description: t("scenarioPlanner.descriptions.contactExecutor") },
      { timeframe: t("scenarioPlanner.timeframes.firstWeek"), title: t("scenarioPlanner.timelineEvents.locateWill"), description: t("scenarioPlanner.descriptions.locateWill") },
      { timeframe: t("scenarioPlanner.timeframes.firstMonth"), title: t("scenarioPlanner.timelineEvents.executorBeginsProbate"), description: t("scenarioPlanner.descriptions.executorBeginsProbate") }];
    }

    if (scenarioId === 'hospitalized') {
      return [
      { timeframe: t("scenarioPlanner.timeframes.first24Hours"), title: t("scenarioPlanner.timelineEvents.notifyEmployer"), description: t("scenarioPlanner.descriptions.notifyEmployer") },
      { timeframe: t("scenarioPlanner.timeframes.first24Hours"), title: t("scenarioPlanner.timelineEvents.activatePowerOfAttorney"), description: t("scenarioPlanner.descriptions.activatePowerOfAttorney") },
      { timeframe: t("scenarioPlanner.timeframes.firstWeek"), title: t("scenarioPlanner.timelineEvents.arrangeBillPayments"), description: t("scenarioPlanner.descriptions.arrangeBillPayments") },
      { timeframe: t("scenarioPlanner.timeframes.firstMonth"), title: t("scenarioPlanner.timelineEvents.fileDisabilityBenefits"), description: t("scenarioPlanner.descriptions.fileDisabilityBenefits") }];
    }

    return [];
  };
  
  const timelineEvents: TimelineEvent[] = getTimelineEvents(activeScenario);

  const generateActionPlan = () => {
    const currentScenario = scenarios.find((s) => s.id === activeScenario);
    if (!currentScenario) return;

    const plan = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Family Action Plan</h1>
        <h2 style="color: #374151; margin-top: 20px;">${currentScenario.title}</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">${currentScenario.description}</p>
        
        <h3 style="color: #374151; margin-top: 30px;">Current Preparedness Level: ${analysis.preparednessLevel}%</h3>
        
        <h3 style="color: #374151; margin-top: 30px;">Key Vulnerabilities</h3>
        <ul style="line-height: 1.8;">
          ${analysis.vulnerabilities.map((v) => `
            <li><strong>${v.title}:</strong> ${v.description}</li>
          `).join('')}
        </ul>
        
        <h3 style="color: #374151; margin-top: 30px;">Timeline of Actions</h3>
        ${[t("scenarioPlanner.timeframes.first24Hours"), t("scenarioPlanner.timeframes.firstWeek"), t("scenarioPlanner.timeframes.firstMonth"), t("scenarioPlanner.timeframes.threeToSixMonths")].map((timeframe) => {
      const events = timelineEvents.filter((e) => e.timeframe === timeframe);
      if (events.length === 0) return '';
      return `
            <h4 style="color: #4b5563; margin-top: 20px;">${timeframe}</h4>
            <ul style="line-height: 1.8;">
              ${events.map((e) => `<li><strong>${e.title}:</strong> ${e.description}</li>`).join('')}
            </ul>
          `;
    }).join('')}
        
        <h3 style="color: #374151; margin-top: 30px;">Action Items</h3>
        <ol style="line-height: 1.8;">
          ${analysis.mitigationPlan.filter((step) => !step.isCompleted).map((step) => `
            <li>
              <strong>${step.actionTitle}</strong> (${step.estimatedTime})
              <p style="margin-top: 5px; color: #6b7280;">${step.impactStatement}</p>
            </li>
          `).join('')}
        </ol>
        
        <div style="margin-top: 40px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; font-style: italic;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;

    setGeneratedPlan(plan);
    setShowActionPlan(true);
  };

  const handlePrintPlan = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Family Action Plan</title>
            <style>
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${generatedPlan}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-4 md:p-6 font-sans max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t("scenarioPlanner.scenario_planner_1")}</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">{t("scenarioPlanner.let_s_see_how_prepared_your_fa_2")}</p>
        </div>
        <Button onClick={() => generateActionPlan()} className="flex items-center gap-2 w-full sm:w-auto">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">{t("scenarioPlanner.generate_family_action_plan_3")}</span>
          <span className="sm:hidden">{t("scenarioPlanner.generate_plan_4")}</span>
        </Button>
      </div>

      {/* Scenario Selector */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 mt-4 border-b overflow-x-auto">
        {scenarios.map((scenario) =>
        <button
          key={scenario.id}
          onClick={() => setActiveScenario(scenario.id)}
          className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
          activeScenario === scenario.id ?
          'border-b-2 border-blue-600 text-blue-600 bg-blue-50 sm:bg-transparent' :
          'text-gray-500'}`
          }>

            <span className="text-base md:text-lg">{scenario.icon}</span>
            <span className="hidden md:inline">{scenario.title}</span>
            <span className="md:hidden">{scenario.title.split(' ').slice(0, 3).join(' ')}{t("guardian.templateModal._1")}</span>
          </button>
        )}
      </div>

      {/* Scenario Analysis Display */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Side: Current Vulnerabilities */}
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-base md:text-lg text-gray-800">{t("scenarioPlanner.current_family_vulnerabilities_6")}</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{t("scenarioPlanner.without_proper_preparation_you_7")}</p>
            <div className="mt-3 md:mt-4 space-y-3">
              {analysis.vulnerabilities.map((vulnerability, index) =>
              <div key={index} className="flex items-start p-3 md:p-4 bg-red-50 border-l-4 border-red-400 rounded">
                  <span className="text-red-500 text-lg md:text-xl mr-2 md:mr-3 flex-shrink-0">⚠️</span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm md:text-base text-gray-800">{vulnerability.title}</h4>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">{vulnerability.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Projected Timeline */}
          <div>
            <h3 className="font-bold text-base md:text-lg text-gray-800">{t("scenarioPlanner.projected_timeline_8")}</h3>
            <div className="mt-3 md:mt-4 space-y-3">
              {timelineEvents.map((event, index) =>
              <div key={index} className="p-3 md:p-4 bg-gray-50 border-l-4 border-gray-300 rounded">
                  <strong className="text-xs md:text-sm text-gray-700">{event.timeframe}</strong>
                  <p className="mt-2 text-xs md:text-sm">
                    <strong>{event.title}</strong>: {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Potential Financial Impact */}
          <div>
            <h3 className="font-bold text-base md:text-lg text-gray-800">{t("scenarioPlanner.potential_financial_impact_9")}</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{t("scenarioPlanner.these_are_estimates_of_the_pos_10")}

            </p>
            <div className="mt-3 md:mt-4 space-y-2">
              <div className="p-3 md:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-xs md:text-sm">
                  <strong>{t("scenarioPlanner.no_will_11")}</strong>{t("scenarioPlanner.potential_cost_of_lengthy_prob_12")}<strong className="block sm:inline mt-1 sm:mt-0">{t("scenarioPlanner.5_000_15_000_13")}</strong>{t("scenarioPlanner.estimated_14")}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-xs md:text-sm">{t("scenarioPlanner.potential_loss_of_business_rev_15")}
                  <strong className="block sm:inline mt-1 sm:mt-0">{t("scenarioPlanner.20_000_16")}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Preparedness Blueprint */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base md:text-lg text-gray-800">{t("scenarioPlanner.your_preparedness_blueprint_17")}</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{t("scenarioPlanner.your_family_is_currently_18")}
              <span className="font-bold text-blue-600">{analysis.preparednessLevel}%</span>{t("scenarioPlanner.protected_in_this_scenario_19")}
            </p>
          
            {/* Progress Bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 md:h-3">
              <div
                className="bg-blue-600 h-2 md:h-3 rounded-full transition-all duration-500"
                style={{ width: `${analysis.preparednessLevel}%` }} />

            </div>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {analysis.mitigationPlan.map((step) =>
            <div key={step.id} className={`p-3 md:p-4 rounded-lg border ${step.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white shadow-sm'}`}>
                
                {/* The Vulnerability */}
                <div className="flex items-start">
                  <span className={`h-5 w-5 md:h-6 md:w-6 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0 ${step.isCompleted ? 'bg-green-500' : 'bg-red-500'}`}>
                    {step.isCompleted ? '✓' : '!'}
                  </span>
                  <h4 className={`ml-2 md:ml-3 font-semibold text-sm md:text-base ${step.isCompleted ? 'text-gray-500 line-through' : 'text-red-600'}`}>
                    <span className="hidden sm:inline">{t("scenarioPlanner.vulnerability_20")}</span>{step.vulnerability}
                  </h4>
                </div>

                {/* The Mitigation Action or Confirmation */}
                {!step.isCompleted ?
              <div className="mt-3 pl-7 md:pl-9">
                    <p className="font-semibold text-sm md:text-base text-gray-800">
                      <span className="hidden sm:inline">{t("scenarioPlanner.action_required_21")}</span>{step.actionTitle}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {step.impactStatement} <span className="font-semibold block sm:inline mt-1 sm:mt-0">({step.estimatedTime})</span>
                    </p>
                    <button className="mt-3 px-4 py-2.5 text-xs md:text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto">{t("scenarioPlanner.resolve_this_vulnerability_22")}

                </button>
                  </div> :

              <div className="mt-3 pl-7 md:pl-9">
                    <p className="font-semibold text-xs md:text-sm text-green-700">{t("scenarioPlanner.resolved_23")}
                  {step.impactStatement}
                    </p>
                  </div>
              }
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Plan Modal */}
      <Dialog open={showActionPlan} onOpenChange={setShowActionPlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("scenarioPlanner.family_action_plan_24")}</DialogTitle>
            <DialogDescription>{t("scenarioPlanner.a_comprehensive_guide_for_your_25")}

            </DialogDescription>
          </DialogHeader>
          
          <div
            className="border rounded-lg p-4 bg-white my-4"
            dangerouslySetInnerHTML={{ __html: generatedPlan }} />

          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionPlan(false)}>
              Close
            </Button>
            <Button onClick={handlePrintPlan}>
              <Printer className="w-4 h-4 mr-2" />{t("scenarioPlanner.print_plan_26")}

            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

};

// Placeholder Icons
const HospitalIcon = () => <span>🏥</span>;
const IncapacityIcon = () => <span>{t("scenarioPlanner._27")}</span>;
const HeartbreakIcon = () => <span>💔</span>;



export default ScenarioPlanner;