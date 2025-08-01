import { DocumentCategory, ExtractedMetadata, PossessionAreaId } from '../types/document-ai';

interface CategorySuggestion {
  suggestedArea: PossessionAreaId;
  confidence: number; // 0-1 confidence score
  reasoning: string;
  alternativeSuggestions?: Array<{
    area: PossessionAreaId;
    confidence: number;
    reasoning: string;
  }>;
}

export async function suggestCategory(
  docCategory: DocumentCategory, 
  metadata: ExtractedMetadata,
  extractedText?: string
): Promise<CategorySuggestion> {
  // Analyze the document type and metadata to make intelligent suggestions
  const suggestion = analyzeDocumentForSuggestion(docCategory, metadata, extractedText);
  
  // Calculate confidence based on how much metadata we have
  const confidence = calculateConfidence(docCategory, metadata);
  
  // Find alternative suggestions if confidence is not high
  const alternatives = confidence < 0.8 
    ? findAlternativeSuggestions(docCategory, metadata, suggestion.area)
    : undefined;
  
  return {
    suggestedArea: suggestion.area,
    confidence: confidence,
    reasoning: suggestion.reasoning,
    alternativeSuggestions: alternatives
  };
}

function analyzeDocumentForSuggestion(
  docCategory: DocumentCategory,
  metadata: ExtractedMetadata,
  extractedText?: string
): { area: PossessionAreaId; reasoning: string } {
  
  // Check metadata for specific indicators
  const textLower = extractedText?.toLowerCase() || '';
  const hasBusinessName = metadata.businessName || metadata.einNumber;
  const hasPropertyInfo = metadata.propertyAddress || metadata.parcelNumber;
  const hasVehicleInfo = metadata.vinNumber || metadata.make || metadata.model;
  const hasFinancialInfo = metadata.accountNumber || metadata.balance !== undefined;
  
  switch (docCategory) {
    case 'insurance_policy': {
      // Analyze the type of insurance
      const policyType = metadata.policyType?.toLowerCase() || '';
      
      if (policyType.includes('home') || policyType.includes('property') || hasPropertyInfo) {
        return { 
          area: 'home', 
          reasoning: 'This is a homeowners insurance policy that protects your property' 
        };
      }
      if (policyType.includes('auto') || policyType.includes('vehicle') || hasVehicleInfo) {
        return { 
          area: 'home', 
          reasoning: 'Vehicle insurance is typically managed alongside home and property' 
        };
      }
      if (policyType.includes('life') || policyType.includes('disability')) {
        return { 
          area: 'personal', 
          reasoning: 'Life and disability insurance are personal protection documents' 
        };
      }
      if (policyType.includes('business') || hasBusinessName) {
        return { 
          area: 'business', 
          reasoning: 'This appears to be business insurance' 
        };
      }
      // Default for insurance
      return { 
        area: 'personal', 
        reasoning: 'Insurance policies protect your personal interests' 
      };
    }

    case 'property_deed':
      return { 
        area: 'home', 
        reasoning: 'Property deeds belong with your home and real estate documents' 
      };

    case 'vehicle_title':
      return { 
        area: 'home', 
        reasoning: 'Vehicle titles are typically stored with home and property documents' 
      };

    case 'bank_statement': {
      // Check if it's a business account
      if (hasBusinessName || textLower.includes('business') || textLower.includes('commercial')) {
        return { 
          area: 'business', 
          reasoning: 'This appears to be a business bank account' 
        };
      }
      // Check account type
      const accountType = metadata.accountType?.toLowerCase() || '';
      if (accountType.includes('savings') || accountType.includes('money market')) {
        return { 
          area: 'savings', 
          reasoning: 'Savings account statements belong with your financial assets' 
        };
      }
      return { 
        area: 'personal', 
        reasoning: 'Personal banking documents for everyday finances' 
      };
    }

    case 'investment_statement':
      return { 
        area: 'savings', 
        reasoning: 'Investment accounts are part of your savings and future planning' 
      };

    case 'will_or_trust':
      return { 
        area: 'personal', 
        reasoning: 'Estate planning documents are crucial personal legal documents' 
      };

    case 'business_document':
      return { 
        area: 'business', 
        reasoning: 'Business formation and operational documents' 
      };

    case 'personal_id':
      return { 
        area: 'personal', 
        reasoning: 'Personal identification documents for you and your family' 
      };

    case 'tax_document': {
      // Check if business tax document
      if (hasBusinessName || textLower.includes('schedule c') || textLower.includes('1120')) {
        return { 
          area: 'business', 
          reasoning: 'Business tax documents and returns' 
        };
      }
      return { 
        area: 'personal', 
        reasoning: 'Personal tax returns and documentation' 
      };
    }

    case 'medical_document':
      return { 
        area: 'personal', 
        reasoning: 'Medical records and healthcare documents for your family' 
      };

    default:
      // Try to make an intelligent guess based on content
      if (hasBusinessName || textLower.includes('business') || textLower.includes('llc')) {
        return { 
          area: 'business', 
          reasoning: 'Document appears to be business-related' 
        };
      }
      if (hasPropertyInfo || textLower.includes('property') || textLower.includes('real estate')) {
        return { 
          area: 'home', 
          reasoning: 'Document appears to be property-related' 
        };
      }
      if (hasFinancialInfo || textLower.includes('investment') || textLower.includes('retirement')) {
        return { 
          area: 'savings', 
          reasoning: 'Document appears to be finance-related' 
        };
      }
      
      return { 
        area: 'personal', 
        reasoning: 'General document for personal records' 
      };
  }
}

function calculateConfidence(
  docCategory: DocumentCategory,
  metadata: ExtractedMetadata
): number {
  let confidence = 0.5; // Base confidence
  
  // Document type match gives good confidence
  const wellDefinedCategories = [
    'property_deed', 'vehicle_title', 'investment_statement', 
    'will_or_trust', 'business_document'
  ];
  if (wellDefinedCategories.includes(docCategory)) {
    confidence += 0.3;
  }
  
  // Having specific metadata increases confidence
  if (metadata.policyType) confidence += 0.1;
  if (metadata.businessName || metadata.einNumber) confidence += 0.1;
  if (metadata.propertyAddress) confidence += 0.1;
  if (metadata.accountType) confidence += 0.1;
  if (metadata.vinNumber) confidence += 0.1;
  
  // Having multiple relevant fields increases confidence
  const metadataFieldCount = Object.keys(metadata).filter(
    key => metadata[key] !== undefined && metadata[key] !== null
  ).length;
  
  if (metadataFieldCount > 5) confidence += 0.1;
  if (metadataFieldCount > 10) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function findAlternativeSuggestions(
  docCategory: DocumentCategory,
  metadata: ExtractedMetadata,
  primarySuggestion: PossessionAreaId
): Array<{ area: PossessionAreaId; confidence: number; reasoning: string }> {
  const alternatives: Array<{ area: PossessionAreaId; confidence: number; reasoning: string }> = [];
  
  // For insurance policies, could be personal or related to specific asset
  if (docCategory === 'insurance_policy') {
    if (primarySuggestion !== 'personal') {
      alternatives.push({
        area: 'personal',
        confidence: 0.6,
        reasoning: 'Insurance policies can also be filed with personal documents'
      });
    }
    if (primarySuggestion !== 'home' && (metadata.policyType === 'home' || metadata.propertyAddress)) {
      alternatives.push({
        area: 'home',
        confidence: 0.7,
        reasoning: 'Property-related insurance could be filed with home documents'
      });
    }
  }
  
  // Bank statements could go in multiple places
  if (docCategory === 'bank_statement') {
    if (primarySuggestion !== 'savings') {
      alternatives.push({
        area: 'savings',
        confidence: 0.5,
        reasoning: 'Bank statements can be filed with savings and investments'
      });
    }
  }
  
  // Tax documents might be business or personal
  if (docCategory === 'tax_document') {
    if (primarySuggestion !== 'business' && metadata.businessName) {
      alternatives.push({
        area: 'business',
        confidence: 0.6,
        reasoning: 'May be business-related tax document'
      });
    }
    if (primarySuggestion !== 'personal') {
      alternatives.push({
        area: 'personal',
        confidence: 0.6,
        reasoning: 'Could be personal tax documentation'
      });
    }
  }
  
  return alternatives.slice(0, 2); // Return max 2 alternatives
}

// Helper function to get human-friendly area descriptions
export function getAreaDescription(areaId: PossessionAreaId): string {
  const descriptions: Record<PossessionAreaId, string> = {
    home: 'Your Home & Property - Real estate, vehicles, and property-related documents',
    savings: 'Your Savings & Investments - Financial accounts and investment documents',
    business: 'Your Business - Business ownership and operational documents',
    valuables: 'Your Valuables & Collections - Documentation for valuable items',
    personal: 'Personal & Legal - IDs, medical records, estate planning, and personal documents'
  };
  
  return descriptions[areaId] || 'Personal documents';
}

// Batch suggestion for multiple documents
export async function suggestCategoriesBatch(
  documents: Array<{
    category: DocumentCategory;
    metadata: ExtractedMetadata;
    extractedText?: string;
  }>
): Promise<CategorySuggestion[]> {
  return Promise.all(
    documents.map(doc => 
      suggestCategory(doc.category, doc.metadata, doc.extractedText)
    )
  );
}
