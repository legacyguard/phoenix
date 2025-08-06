import { useTranslation } from 'react-i18next';

interface LegalDocument {
  id: string;
  type: 'will' | 'trust' | 'powerOfAttorney' | 'livingWill' | 'healthcareDirective';
  content: string;
  disclaimers: string[];
  executionRequirements: string[];
  jurisdiction: string;
  generatedDate: string;
  lastUpdated: string;
}

interface WillDocument {
  testatorName: string;
  testatorAddress: string;
  executorName: string;
  executorAddress: string;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    share: string;
  }>;
  assets: Array<{
    description: string;
    value: string;
    beneficiary: string;
  }>;
  specialInstructions: string;
  jurisdiction: string;
}

export class LegalDocumentService {
  private legalEndpoint = process.env.NEXT_PUBLIC_LEGAL_SERVICE_ENDPOINT || '';
  private legalApiKey = process.env.LEGAL_SERVICE_API_KEY || '';

  // Generate will document with legal disclaimers
  async generateWillDocument(willData: WillDocument): Promise<LegalDocument> {
    const disclaimers = this.getLegalDisclaimers('willGenerator');
    const executionRequirements = this.getExecutionRequirements(willData.jurisdiction);
    
    try {
      const response = await fetch(`${this.legalEndpoint}/generate-will`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.legalApiKey}`
        },
        body: JSON.stringify({
          willData,
          disclaimers,
          executionRequirements,
          jurisdiction: willData.jurisdiction
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate will document');
      }

      const result = await response.json();
      return {
        id: result.id,
        type: 'will',
        content: result.content,
        disclaimers: result.disclaimers,
        executionRequirements: result.executionRequirements,
        jurisdiction: willData.jurisdiction,
        generatedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating will document:', error);
      throw error;
    }
  }

  // Get legal disclaimers using translations
  private getLegalDisclaimers(type: 'general' | 'willGenerator' | 'jurisdiction' | 'notLegalAdvice' | 'professionalReview'): string[] {
    // This would use the translation system
    // For now, returning hardcoded content that matches the translation structure
    const disclaimers = {
      general: "LegacyGuard provides tools and guidance for estate planning but does not provide legal advice. For complex estates or specific legal questions, please consult with a qualified attorney in your jurisdiction.",
      willGenerator: "The will generator creates documents based on information you provide. While designed to meet legal requirements, we strongly recommend having any generated will reviewed by a qualified attorney before execution.",
      jurisdiction: "Legal requirements vary by jurisdiction. Ensure your documents comply with the laws in your area.",
      notLegalAdvice: "This service does not constitute legal advice and should not be relied upon as such.",
      professionalReview: "For complex estates, business interests, or unique family situations, professional legal review is strongly recommended."
    };

    return [disclaimers[type]];
  }

  // Get execution requirements using translations
  private getExecutionRequirements(jurisdiction: string): string[] {
    return [
      `Witness Requirements for ${jurisdiction}`,
      "Notarization Requirements",
      "Proper Signing Instructions",
      "Secure Storage Guidelines",
      "Legal Compliance Verification"
    ];
  }

  // Get compliance information using translations
  getComplianceInformation(): {
    dataProtection: string;
    encryption: string;
    retention: string;
    access: string;
    portability: string;
  } {
    return {
      dataProtection: "Your data is protected in compliance with applicable data protection laws including GDPR and CCPA.",
      encryption: "All sensitive information is encrypted using industry-standard encryption methods.",
      retention: "Data retention policies are designed to protect your privacy while ensuring your family can access important information when needed.",
      access: "You have the right to access, modify, or delete your personal information at any time.",
      portability: "You can export your data in standard formats for use with other services."
    };
  }

  // Get terms and conditions using translations
  getTermsAndConditions(): {
    serviceTerms: string;
    privacyPolicy: string;
    dataProcessing: string;
    userAgreement: string;
    acceptanceRequired: string;
    lastUpdated: string;
    effectiveDate: string;
  } {
    return {
      serviceTerms: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      dataProcessing: "Data Processing Agreement",
      userAgreement: "User Agreement",
      acceptanceRequired: "By using LegacyGuard, you agree to our Terms of Service and Privacy Policy.",
      lastUpdated: `Last updated: ${new Date().toLocaleDateString()}`,
      effectiveDate: `Effective date: ${new Date().toLocaleDateString()}`
    };
  }

  // Validate legal document
  async validateLegalDocument(document: LegalDocument): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.legalEndpoint}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.legalApiKey}`
        },
        body: JSON.stringify({
          document,
          jurisdiction: document.jurisdiction
        })
      });

      if (!response.ok) {
        throw new Error('Failed to validate legal document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating legal document:', error);
      throw error;
    }
  }

  // Schedule legal review
  async scheduleLegalReview(documentId: string, userId: string, preferences: {
    preferredDate?: string;
    preferredTime?: string;
    attorneyType?: string;
    urgency?: 'low' | 'medium' | 'high';
  }): Promise<{
    reviewId: string;
    scheduledDate: string;
    attorneyName: string;
    attorneyContact: string;
    preparationInstructions: string[];
  }> {
    try {
      const response = await fetch(`${this.legalEndpoint}/schedule-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.legalApiKey}`
        },
        body: JSON.stringify({
          documentId,
          userId,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule legal review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error scheduling legal review:', error);
      throw error;
    }
  }

  // Generate legal document summary
  generateDocumentSummary(document: LegalDocument): {
    type: string;
    jurisdiction: string;
    keyPoints: string[];
    nextSteps: string[];
    disclaimers: string[];
  } {
    const keyPoints = [
      `Document Type: ${document.type}`,
      `Jurisdiction: ${document.jurisdiction}`,
      `Generated: ${new Date(document.generatedDate).toLocaleDateString()}`,
      `Last Updated: ${new Date(document.lastUpdated).toLocaleDateString()}`
    ];

    const nextSteps = [
      "Review the document carefully for accuracy",
      "Print the required number of copies",
      "Sign in the presence of required witnesses",
      "Store the original in a secure location",
      "Consider professional legal review"
    ];

    return {
      type: document.type,
      jurisdiction: document.jurisdiction,
      keyPoints,
      nextSteps,
      disclaimers: document.disclaimers
    };
  }

  // Export legal document
  async exportLegalDocument(documentId: string, format: 'pdf' | 'docx' | 'txt'): Promise<{
    downloadUrl: string;
    expiryDate: string;
    format: string;
    size: string;
  }> {
    try {
      const response = await fetch(`${this.legalEndpoint}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.legalApiKey}`
        },
        body: JSON.stringify({
          documentId,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export legal document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting legal document:', error);
      throw error;
    }
  }

  // Get jurisdiction-specific requirements
  async getJurisdictionRequirements(jurisdiction: string): Promise<{
    witnessCount: number;
    notaryRequired: boolean;
    specificRequirements: string[];
    commonIssues: string[];
  }> {
    try {
      const response = await fetch(`${this.legalEndpoint}/jurisdiction/${jurisdiction}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.legalApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get jurisdiction requirements');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting jurisdiction requirements:', error);
      throw error;
    }
  }

  // Create legal document template
  createDocumentTemplate(type: string, jurisdiction: string): {
    template: string;
    placeholders: string[];
    instructions: string[];
  } {
    const templates = {
      will: {
        template: `
          LAST WILL AND TESTAMENT
          
          I, {{testatorName}}, of {{testatorAddress}}, being of sound mind and body, do hereby make, publish, and declare this to be my Last Will and Testament.
          
          ARTICLE I - EXECUTOR
          I appoint {{executorName}} of {{executorAddress}} as Executor of this Will.
          
          ARTICLE II - BENEFICIARIES
          {{#each beneficiaries}}
          I give {{share}} of my estate to {{name}}, my {{relationship}}.
          {{/each}}
          
          ARTICLE III - SPECIFIC BEQUESTS
          {{#each assets}}
          I give my {{description}} (valued at {{value}}) to {{beneficiary}}.
          {{/each}}
          
          ARTICLE IV - SPECIAL INSTRUCTIONS
          {{specialInstructions}}
          
          IN WITNESS WHEREOF, I have hereunto set my hand this {{date}} day of {{month}}, {{year}}.
          
          {{testatorName}}
          
          WITNESSES:
          {{#each witnesses}}
          {{name}}
          {{/each}}
        `,
        placeholders: [
          'testatorName',
          'testatorAddress',
          'executorName',
          'executorAddress',
          'beneficiaries',
          'assets',
          'specialInstructions',
          'date',
          'month',
          'year',
          'witnesses'
        ],
        instructions: [
          "Fill in all placeholder fields",
          "Ensure all names and addresses are accurate",
          "Review beneficiary designations carefully",
          "Consider tax implications",
          "Have document reviewed by attorney"
        ]
      }
    };

    return templates[type as keyof typeof templates] || {
      template: "Template not found",
      placeholders: [],
      instructions: []
    };
  }
}

// Export singleton instance
export const legalDocumentService = new LegalDocumentService(); 