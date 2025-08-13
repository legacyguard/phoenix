export interface AIAnalysisResult {
  type: 'insurance' | 'bank' | 'property' | 'medical' | 'legal' | 'other';
  confidence: number;
  extractedData: {
    contractNumber?: string;
    expirationDate?: string;
    amount?: number;
    beneficiaries?: string[];
    issuer?: string;
  };
  suggestedActions: string[];
  relatedAssets: string[];
}

export const DocumentAIService = {
  async analyzeDocument(file: File): Promise<AIAnalysisResult> {
    const name = file.name.toLowerCase();
    let type: AIAnalysisResult['type'] = 'other';
    if (name.includes('poist') || name.includes('insurance')) type = 'insurance';
    else if (name.includes('bank')) type = 'bank';
    else if (name.includes('property') || name.includes('nehnut')) type = 'property';
    else if (name.includes('medical') || name.includes('zdrav')) type = 'medical';
    else if (name.includes('legal') || name.includes('pravn')) type = 'legal';

    const extractedData: AIAnalysisResult['extractedData'] = {};
    if (type === 'insurance') {
      extractedData.contractNumber = 'INS-' + Math.floor(Math.random() * 100000);
      extractedData.expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      extractedData.issuer = 'Bežná poisťovňa';
    } else if (type === 'bank') {
      extractedData.contractNumber = 'ACC-' + Math.floor(Math.random() * 100000);
      extractedData.issuer = 'Bežná banka';
    }

    const confidence = 0.6 + Math.random() * 0.3;

    let suggestedActions: string[] = [];
    if (type === 'insurance') {
      suggestedActions = [
        'Skontrolujte dátum expirácie',
        'Uložte kópiu zmluvy do trezora',
        'Kontaktujte svojho poistného agenta 30 dní pred expiráciou',
      ];
    } else if (type === 'bank') {
      suggestedActions = [
        'Pridajte manžela/manželku ako oprávnenú osobu',
        'Zabezpečte heslá a prihlasovacie údaje',
      ];
    }

    return {
      type,
      confidence,
      extractedData,
      suggestedActions,
      relatedAssets: [],
    };
  },
};


