export interface PlaybookTemplate {
  id: string;
  title: string;
  category: string;
  tone: 'formal' | 'personal' | 'professional';
  content: string;
  tags?: string[];
  variables?: string[];
}

export interface PlaybookTemplates {
  funeral_wishes: PlaybookTemplate[];
  digital_accounts_shutdown: PlaybookTemplate[];
  important_contacts: PlaybookTemplate[];
  document_locations: PlaybookTemplate[];
  personal_messages: PlaybookTemplate[];
  practical_instructions: PlaybookTemplate[];
}

// Function to create playbook templates with translations
export const createPlaybookTemplates = (t?: (key: string, params?: Record<string, unknown>) => string): PlaybookTemplates => {
  // Default translation function if none provided
  const translate = t || ((key: string) => key);
  
  return {
  funeral_wishes: [
    {
      id: 'fw_religious_burial',
      title: translate('playbook.templates.funeralWishes.traditionalReligiousBurial'),
      category: 'religious',
      tone: 'formal',
      content: `I wish to have a traditional {{religion}} funeral service. 

Please arrange for:
- A service at {{place_of_worship}} with {{religious_leader}}
- Burial at {{cemetery_name}} cemetery
- Traditional prayers and readings from {{religious_text}}
- {{hymns_or_songs}} to be played/sung during the service

Special requests:
- Please ensure {{specific_customs}} are observed
- I would like {{pallbearers}} to serve as pallbearers
- Donations in lieu of flowers to {{charity_name}}`,
      variables: ['religion', 'place_of_worship', 'religious_leader', 'cemetery_name', 'religious_text', 'hymns_or_songs', 'specific_customs', 'pallbearers', 'charity_name']
    },
    {
      id: 'fw_secular_cremation',
      title: translate('playbook.templates.funeralWishes.simpleCremationService'),
      category: 'secular',
      tone: 'personal',
      content: `I prefer a simple, non-religious cremation without a formal ceremony.

My wishes:
- Direct cremation at {{crematorium_name}}
- No viewing or formal service
- My ashes should be {{ash_instructions}}
- Instead of a funeral, please gather for a celebration of life at {{location}}

Please play these songs: {{favorite_songs}}
Share stories and memories, laugh together, and remember the good times.`,
      variables: ['crematorium_name', 'ash_instructions', 'location', 'favorite_songs']
    },
    {
      id: 'fw_green_burial',
      title: translate('playbook.templates.funeralWishes.ecoFriendlyNaturalBurial'),
      category: 'environmental',
      tone: 'personal',
      content: `I wish for a natural, environmentally-friendly burial.

Please arrange:
- Natural burial at {{natural_cemetery}} or woodland burial ground
- Biodegradable coffin made from {{material}} (wicker, cardboard, or untreated wood)
- No embalming or chemical preservation
- Native wildflowers instead of cut flowers
- A tree planted at my burial site: {{tree_type}}

The ceremony should be simple and held outdoors if possible. Please share readings about nature and our connection to the earth.`,
      variables: ['natural_cemetery', 'material', 'tree_type']
    }
  ],

  digital_accounts_shutdown: [
    {
      id: 'da_comprehensive',
      title: translate('playbook.templates.digitalAccountsShutdown.comprehensiveDigitalShutdown'),
      category: 'detailed',
      tone: 'professional',
      content: `Please handle my digital accounts as follows:

SOCIAL MEDIA:
- Facebook: {{facebook_action}} (memorialize/delete)
- Instagram: {{instagram_action}}
- LinkedIn: Close account after downloading connections
- Twitter/X: {{twitter_action}}

EMAIL ACCOUNTS:
- Primary email ({{primary_email}}): Set auto-responder for 6 months, then close
- Work email: Already handled by employer

FINANCIAL:
- Online banking: Bank will handle upon death notification
- PayPal: Close after transferring balance
- Crypto wallets: Access info in safety deposit box

SUBSCRIPTIONS:
- Cancel all recurring subscriptions
- Netflix, Spotify, etc.: Cancel immediately
- Cloud storage: Download all data first, then cancel

IMPORTANT: Password manager details are in the safe.`,
      variables: ['facebook_action', 'instagram_action', 'twitter_action', 'primary_email']
    },
    {
      id: 'da_minimal',
      title: translate('playbook.templates.digitalAccountsShutdown.minimalDigitalFootprint'),
      category: 'simple',
      tone: 'personal',
      content: `I have a minimal online presence. Please:

- Delete my Facebook account completely
- Close my email account {{email_address}} after 3 months
- Cancel my mobile phone contract with {{provider}}
- No other significant digital accounts exist

All passwords are written in the blue notebook in my desk drawer.`,
      variables: ['email_address', 'provider']
    },
    {
      id: 'da_professional',
      title: translate('playbook.templates.digitalAccountsShutdown.professionalBusinessAccounts'),
      category: 'business',
      tone: 'professional',
      content: `BUSINESS ACCOUNTS - TRANSFER BEFORE CLOSING:
- Company email: Transfer to {{successor_name}}
- LinkedIn: Keep active for 1 year for business contacts
- GitHub/GitLab: Transfer repositories to {{tech_successor}}
- Domain names: Transfer to {{domain_recipient}}

PERSONAL ACCOUNTS:
- Personal email: Auto-responder for 1 year
- Social media: Convert to memorial pages
- Google/Apple accounts: Download all data for family

CRITICAL: Business banking and merchant accounts - see lawyer immediately.`,
      variables: ['successor_name', 'tech_successor', 'domain_recipient']
    }
  ],

  important_contacts: [
    {
      id: 'ic_essential',
      title: translate('playbook.templates.importantContacts.essentialContactsList'),
      category: 'comprehensive',
      tone: 'professional',
      content: `IMMEDIATE CONTACTS (Call within 24 hours):
- Family Doctor: Dr. {{doctor_name}} - {{doctor_phone}}
- Lawyer: {{lawyer_name}} - {{lawyer_phone}}
- Employer: {{employer_contact}} - {{employer_phone}}

FINANCIAL CONTACTS:
- Bank Manager: {{bank_manager}} - {{bank_phone}}
- Insurance Agent: {{insurance_agent}} - {{insurance_phone}}
- Accountant: {{accountant_name}} - {{accountant_phone}}

FAMILY TO NOTIFY:
{{family_contacts}}

CLOSE FRIENDS:
{{friend_contacts}}`,
      variables: ['doctor_name', 'doctor_phone', 'lawyer_name', 'lawyer_phone', 'employer_contact', 'employer_phone', 'bank_manager', 'bank_phone', 'insurance_agent', 'insurance_phone', 'accountant_name', 'accountant_phone', 'family_contacts', 'friend_contacts']
    },
    {
      id: 'ic_childcare',
      title: translate('playbook.templates.importantContacts.childrenDependentsContacts'),
      category: 'family',
      tone: 'personal',
      content: `FOR THE CHILDREN:
- School: {{school_name}} - {{school_phone}}
- Pediatrician: Dr. {{pediatrician}} - {{pediatrician_phone}}
- Babysitter: {{babysitter_name}} - {{babysitter_phone}}
- After-school: {{afterschool_contact}}

TEMPORARY GUARDIANS (if needed):
- First choice: {{guardian1_name}} - {{guardian1_phone}}
- Second choice: {{guardian2_name}} - {{guardian2_phone}}

The children's schedules, medical info, and preferences are in the red folder in the kitchen drawer.`,
      variables: ['school_name', 'school_phone', 'pediatrician', 'pediatrician_phone', 'babysitter_name', 'babysitter_phone', 'afterschool_contact', 'guardian1_name', 'guardian1_phone', 'guardian2_name', 'guardian2_phone']
    }
  ],

  document_locations: [
    {
      id: 'dl_home_organized',
      title: translate('playbook.templates.documentLocations.homeFilingSystem'),
      category: 'home',
      tone: 'professional',
      content: `All important documents are in the home office filing cabinet:

TOP DRAWER - LEGAL:
- Will (original): Red folder marked "WILL"
- Power of Attorney documents
- Property deeds: Blue folder
- Marriage certificate

MIDDLE DRAWER - FINANCIAL:
- Insurance policies: Green folders by company
- Bank statements: Last 2 years
- Investment accounts: Yellow folder
- Tax returns: Last 7 years

BOTTOM DRAWER - PERSONAL:
- Passports: Family passports in fireproof box
- Birth certificates: Clear plastic folder
- Medical records: By family member

SAFE COMBINATION: {{safe_combination}}
SAFETY DEPOSIT BOX: {{bank_name}} branch, Box #{{box_number}}, key in bedroom dresser`,
      variables: ['safe_combination', 'bank_name', 'box_number']
    },
    {
      id: 'dl_professional_storage',
      title: translate('playbook.templates.documentLocations.professionalStorage'),
      category: 'professional',
      tone: 'formal',
      content: `Documents are professionally stored as follows:

WITH LAWYER ({{lawyer_name}}):
- Original will and codicils
- Trust documents
- Business agreements
- Power of attorney

SAFETY DEPOSIT BOX at {{bank_name}}:
- Property deeds
- Investment certificates
- Insurance policies
- Family jewelry appraisals

HOME SAFE:
- Copies of all legal documents
- Passports
- Emergency cash
- USB with document scans

Digital copies: Encrypted USB in safety deposit box`,
      variables: ['lawyer_name', 'bank_name']
    }
  ],

  personal_messages: [
    {
      id: 'pm_spouse',
      title: translate('playbook.templates.personalMessages.letterToSpousePartner'),
      category: 'family',
      tone: 'personal',
      content: `My dearest {{spouse_name}},

If you're reading this, it means I'm no longer by your side, but please know that my love for you transcends any physical boundary.

We've shared {{years_together}} incredible years together, and every moment has been a gift. From {{special_memory}} to the quiet Sunday mornings with coffee, you've made my life complete.

Please remember:
- You are stronger than you know
- It's okay to grieve, but also okay to find joy again
- {{specific_advice}}
- The kids will need you to show them it's possible to carry on

I want you to know that {{personal_message}}

All my love, always,
{{your_name}}`,
      variables: ['spouse_name', 'years_together', 'special_memory', 'specific_advice', 'personal_message', 'your_name']
    },
    {
      id: 'pm_children',
      title: translate('playbook.templates.personalMessages.letterToChildren'),
      category: 'family',
      tone: 'personal',
      content: `To my beloved {{children_names}},

I'm writing this letter for you to read when I can no longer tell you these things in person.

First and foremost: I love you more than words can express. Being your parent has been the greatest privilege of my life.

Things I want you to remember:
- {{life_lesson_1}}
- {{life_lesson_2}}
- Always be kind, but don't let anyone dim your light
- Your dreams are valid and worth pursuing

{{personal_messages_to_each}}

Take care of each other and your {{other_parent}}. You are my legacy, and I couldn't be prouder.

With endless love,
{{parent_signature}}`,
      variables: ['children_names', 'life_lesson_1', 'life_lesson_2', 'personal_messages_to_each', 'other_parent', 'parent_signature']
    },
    {
      id: 'pm_parents',
      title: translate('playbook.templates.personalMessages.letterToParents'),
      category: 'family', 
      tone: 'personal',
      content: `Dear Mom and Dad,

No parent should have to say goodbye to their child, and I'm so sorry you're reading this.

Thank you for:
- {{gratitude_1}}
- {{gratitude_2}}
- Teaching me the values that shaped who I became
- Your unconditional love and support

Please don't blame yourselves for anything. You gave me a wonderful life and all the tools I needed. {{personal_message}}

Take comfort in knowing that I lived a life filled with love, largely because of the foundation you gave me.

Your loving {{son_daughter}},
{{your_name}}`,
      variables: ['gratitude_1', 'gratitude_2', 'personal_message', 'son_daughter', 'your_name']
    }
  ],

  practical_instructions: [
    {
      id: 'pi_first_48_hours',
      title: translate('playbook.templates.practicalInstructions.first48HoursChecklist'),
      category: 'immediate',
      tone: 'professional',
      content: `IMMEDIATE ACTIONS (First 24-48 hours):

1. Contact funeral home: {{funeral_home}} - {{funeral_phone}}
2. Notify employer: {{employer_contact}}
3. Contact lawyer: {{lawyer_name}} - Will reading and estate matters
4. Call insurance companies (list in filing cabinet)

HOME MAINTENANCE:
- {{utility_instructions}}
- Alarm code: {{alarm_code}}
- Neighbor {{neighbor_name}} has spare key

PETS:
- {{pet_care_instructions}}
- Vet: {{vet_name}} - {{vet_phone}}

CANCEL/POSTPONE:
- Any appointments in my calendar
- Subscriptions and deliveries
- Social commitments

FINANCIAL:
- Do NOT pay any bills until speaking with lawyer
- Bank accounts will be frozen - use emergency cash in safe`,
      variables: ['funeral_home', 'funeral_phone', 'employer_contact', 'lawyer_name', 'utility_instructions', 'alarm_code', 'neighbor_name', 'pet_care_instructions', 'vet_name', 'vet_phone']
    },
    {
      id: 'pi_business_continuity',
      title: translate('playbook.templates.practicalInstructions.businessContinuityPlan'),
      category: 'business',
      tone: 'professional',
      content: `BUSINESS CONTINUITY INSTRUCTIONS:

IMMEDIATE:
- Contact business partner: {{partner_name}} - {{partner_phone}}
- Notify key clients: List in CRM system
- {{employee_notification_plan}}

CRITICAL OPERATIONS:
- Payroll: Due on {{payroll_date}} - {{payroll_contact}}
- Major contracts: {{contract_details}}
- Banking: {{business_banking_instructions}}

TRANSITION PLAN:
- {{succession_plan}}
- Client files: Accessible via {{system_access}}
- Passwords: In company password manager

IMPORTANT DEADLINES:
{{critical_deadlines}}

Legal counsel: {{business_lawyer}} will guide the transition`,
      variables: ['partner_name', 'partner_phone', 'employee_notification_plan', 'payroll_date', 'payroll_contact', 'contract_details', 'business_banking_instructions', 'succession_plan', 'system_access', 'critical_deadlines', 'business_lawyer']
    },
    {
      id: 'pi_household',
      title: translate('playbook.templates.practicalInstructions.householdManagementGuide'),
      category: 'home',
      tone: 'personal',
      content: `KEEPING THE HOUSEHOLD RUNNING:

REGULAR MAINTENANCE:
- Heating system: Service every October with {{heating_company}}
- Garden: {{gardener_name}} comes Thursdays
- Cleaning: {{cleaner_name}} - Mondays and Fridays
- Car service: Due {{car_service_date}} at {{garage_name}}

MONTHLY BILLS (on autopay):
- Utilities: {{utility_companies}}
- Mortgage: {{mortgage_details}}
- Insurance: Annual renewal in {{renewal_month}}

HOUSEHOLD TIPS:
- {{appliance_quirks}}
- Wifi password: {{wifi_password}}
- Main water shutoff: {{water_location}}
- Circuit breaker: Basement, labeled

SEASONAL TASKS:
{{seasonal_maintenance}}`,
      variables: ['heating_company', 'gardener_name', 'cleaner_name', 'car_service_date', 'garage_name', 'utility_companies', 'mortgage_details', 'renewal_month', 'appliance_quirks', 'wifi_password', 'water_location', 'seasonal_maintenance']
    }
  ]
  };
};

// Helper function to get templates by category or tone
export const getTemplatesByFilter = (
  section: keyof PlaybookTemplates,
  filter?: { category?: string; tone?: string },
  t?: (key: string, params?: Record<string, unknown>) => string
): PlaybookTemplate[] => {
  const templates = createPlaybookTemplates(t)[section];
  
  if (filter?.category) {
    templates = templates.filter(t => t.category === filter.category);
  }
  
  if (filter?.tone) {
    templates = templates.filter(t => t.tone === filter.tone);
  }
  
  return templates;
};

// Helper function to extract variables from template content
export const extractVariables = (content: string): string[] => {
  const matches = content.match(/{{([^}]+)}}/g);
  if (!matches) return [];
  
  return [...new Set(matches.map(match => match.replace(/{{|}}/g, '')))];
};

// Helper function to replace variables in template
export const replaceVariables = (
  content: string,
  variables: Record<string, string>
): string => {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};
