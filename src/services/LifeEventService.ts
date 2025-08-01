import { Link } from 'react-router-dom';

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  completed: boolean;
}

export interface LifeEventChecklist {
  eventId: string;
  eventTitle: string;
  congratsMessage?: string;
  tasks: ChecklistTask[];
}

export class LifeEventService {
  static generateChecklist(eventId: string, t?: (key: string, params?: any) => string): LifeEventChecklist {
    // Default translation function if none provided
    const translate = t || ((key: string) => key);
    switch (eventId) {
      case 'married_divorced':
        return {
          eventId,
          eventTitle: translate('lifeEvents.events.marriedDivorced'),
          tasks: [
            {
              id: 'update_beneficiaries',
              title: translate('lifeEvents.tasks.updateBeneficiaries'),
              description: translate('lifeEvents.tasks.updateBeneficiariesDesc'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'update_will',
              title: translate('lifeEvents.tasks.updateWill'),
              description: translate('lifeEvents.tasks.updateWillDesc'),
              actionUrl: '/documents/will',
              completed: false
            },
            {
              id: 'review_trusts',
              title: translate('lifeEvents.tasks.reviewTrusts'),
              description: translate('lifeEvents.tasks.reviewTrustsDesc'),
              actionUrl: '/documents',
              completed: false
            },
            {
              id: 'update_emergency_contacts',
              title: translate('lifeEvents.tasks.updateEmergencyContacts'),
              description: translate('lifeEvents.tasks.updateEmergencyContactsDesc'),
              actionUrl: '/trusted-circle',
              completed: false
            }
          ]
        };
      
      case 'new_child':
        return {
          eventId,
          eventTitle: translate('lifeEvents.events.newChild'),
          congratsMessage: translate('lifeEvents.congratsMessage'),
          tasks: [
            {
              id: 'add_child_roster',
              title: translate('lifeEvents.tasks.addChildRoster'),
              description: translate('lifeEvents.tasks.addChildRosterDesc'),
              actionUrl: '/trusted-circle',
              completed: false
            },
            {
              id: 'update_guardian',
              title: translate('lifeEvents.tasks.updateGuardian'),
              description: translate('lifeEvents.tasks.updateGuardianDesc'),
              actionUrl: '/trusted-circle',
              completed: false
            },
            {
              id: 'review_life_insurance',
              title: translate('lifeEvents.tasks.reviewLifeInsurance'),
              description: translate('lifeEvents.tasks.reviewLifeInsuranceDesc'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'update_will_beneficiary',
              title: translate('lifeEvents.tasks.updateWillBeneficiary'),
              description: translate('lifeEvents.tasks.updateWillBeneficiaryDesc'),
              actionUrl: '/documents/will',
              completed: false
            }
          ]
        };
      
      case 'bought_sold_home':
        return {
          eventId,
          eventTitle: translate('lifeEvents.events.boughtSoldHome'),
          tasks: [
            {
              id: 'update_property_armory',
              title: translate('lifeEvents.tasks.updatePropertyArmory'),
              description: translate('lifeEvents.tasks.updatePropertyArmoryDesc'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'update_mortgage_info',
              title: translate('lifeEvents.tasks.updateMortgageInfo'),
              description: translate('lifeEvents.tasks.updateMortgageInfoDesc'),
              actionUrl: '/documents',
              completed: false
            },
            {
              id: 'review_homeowners_insurance',
              title: translate('lifeEvents.tasks.reviewHomeownersInsurance'),
              description: translate('lifeEvents.tasks.reviewHomeownersInsuranceDesc'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'update_net_worth',
              title: translate('lifeEvents.tasks.updateNetWorth'),
              description: translate('lifeEvents.tasks.updateNetWorthDesc'),
              actionUrl: '/vault',
              completed: false
            }
          ]
        };
      
      case 'started_business':
        return {
          eventId,
          eventTitle: translate('lifeEvents.events.startedBusiness'),
          tasks: [
            {
              id: 'add_business_assets',
              title: translate('lifeEvents.tasks.addBusinessAssets'),
              description: translate('lifeEvents.tasks.addBusinessAssetsDesc'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'create_succession_plan',
              title: translate('lifeEvents.tasks.createSuccessionPlan'),
              description: translate('lifeEvents.tasks.createSuccessionPlanDesc'),
              actionUrl: '/documents',
              completed: false
            },
            {
              id: 'update_insurance',
              title: translate('lifeEvents.tasks.updateInsurance'),
              description: translate('lifeEvents.tasks.updateInsuranceDesc'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'separate_personal_business',
              title: translate('lifeEvents.tasks.separatePersonalBusiness'),
              description: translate('lifeEvents.tasks.separatePersonalBusinessDesc'),
              actionUrl: '/vault',
              completed: false
            }
          ]
        };
      
      case 'trusted_person_passed':
        return {
          eventId,
          eventTitle: translate('lifeEvents.events.trustedPersonPassed'),
          tasks: [
            {
              id: 'remove_deceased',
              title: translate('lifeEvents.tasks.removeDeceased'),
              description: translate('lifeEvents.tasks.removeDeceasedDesc'),
              actionUrl: '/trusted-circle',
              completed: false
            },
            {
              id: 'appoint_new_executor',
              title: translate('lifeEvents.tasks.appointNewExecutor'),
              description: translate('lifeEvents.tasks.appointNewExecutorDesc'),
              actionUrl: '/trusted-circle',
              completed: false
            },
            {
              id: 'update_beneficiaries',
              title: translate('lifeEvents.tasks.updateBeneficiaries'),
              description: translate('lifeEvents.tasks.updateBeneficiariesDesc2'),
              actionUrl: '/vault',
              completed: false
            },
            {
              id: 'update_emergency_contacts',
              title: translate('lifeEvents.tasks.updateEmergencyContacts'),
              description: translate('lifeEvents.tasks.updateEmergencyContactsDesc2'),
              actionUrl: '/trusted-circle',
              completed: false
            }
          ]
        };
      
      default:
        return {
          eventId: 'unknown',
          eventTitle: translate('lifeEvents.events.unknown'),
          tasks: []
        };
    }
  }

  static saveChecklist(userId: string, checklist: LifeEventChecklist) {
    // In a real app, save to database
    const key = `lifeEventChecklist_${userId}`;
    const existing = localStorage.getItem(key);
    const checklists = existing ? JSON.parse(existing) : [];
    
    // Add timestamp
    const checklistWithTime = {
      ...checklist,
      createdAt: new Date().toISOString()
    };
    
    checklists.push(checklistWithTime);
    localStorage.setItem(key, JSON.stringify(checklists));
  }

  static getActiveChecklists(userId: string): LifeEventChecklist[] {
    // In a real app, fetch from database
    const key = `lifeEventChecklist_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  static updateTaskStatus(userId: string, eventId: string, taskId: string, completed: boolean) {
    const checklists = this.getActiveChecklists(userId);
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.eventId === eventId) {
        return {
          ...checklist,
          tasks: checklist.tasks.map(task =>
            task.id === taskId ? { ...task, completed } : task
          )
        };
      }
      return checklist;
    });
    
    localStorage.setItem(`lifeEventChecklist_${userId}`, JSON.stringify(updatedChecklists));
  }
}
