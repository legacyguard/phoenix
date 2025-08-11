import type { ExtractedMetadata, DocumentCategory } from '../types/document-ai';

export async function extractMetadata(
  category: DocumentCategory, 
  textContent: string,
  apiKey: string
): Promise<ExtractedMetadata> {
  try {
    // Validate inputs
    if (!textContent || textContent.trim().length === 0) {
      throw new Error('No text content provided for extraction');
    }

    const systemPrompt = getSystemPromptForCategory(category);
    const userPrompt = formatUserPrompt(textContent, category);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.2 // Very low temperature for consistent extraction
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse and validate the result
    let result: ExtractedMetadata;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    // Clean and validate the extracted data
    return cleanExtractedData(result, category);

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  }
}

function getSystemPromptForCategory(category: DocumentCategory): string {
  const basePrompt = `You are an expert document analyst specializing in extracting structured data from ${category.replace(/_/g, ' ')} documents.
  
  CRITICAL INSTRUCTIONS:
  1. Return ONLY valid JSON with the specified fields
  2. Extract exact values from the document text
  3. Format dates as YYYY-MM-DD
  4. Return numbers without currency symbols or commas
  5. For arrays (like beneficiaries), return as JSON arrays
  6. If a value is not found, omit the key entirely
  7. Do not make up or guess values`;

  const categoryPrompts: Record<DocumentCategory, string> = {
    insurance_policy: `${basePrompt}
    
    Extract these fields from the insurance policy:
    - policyNumber: The policy identifier
    - insurerName: Name of the insurance company
    - insuredName: Name of the insured person(s)
    - coverageAmount: Total coverage amount as a number
    - premiumAmount: Premium payment amount as a number
    - policyType: Type of insurance (life, health, home, auto, disability)
    - beneficiaries: Array of beneficiary names
    - issueDate: Policy issue date
    - expirationDate: Policy expiration or renewal date`,

    property_deed: `${basePrompt}
    
    Extract these fields from the property deed:
    - propertyAddress: Full property address
    - parcelNumber: Assessor's parcel number (APN)
    - ownerNames: Array of all owner names
    - propertyType: Type of property (residential, commercial, land)
    - legalDescription: Legal description of the property
    - issueDate: Date the deed was issued
    - assessedValue: Property value if mentioned`,

    vehicle_title: `${basePrompt}
    
    Extract these fields from the vehicle title:
    - vinNumber: Vehicle Identification Number
    - make: Vehicle manufacturer
    - model: Vehicle model name
    - year: Vehicle year as a number
    - licensePlate: License plate number
    - vehicleOwners: Array of owner names
    - issueDate: Title issue date`,

    bank_statement: `${basePrompt}
    
    Extract these fields from the bank statement:
    - accountNumber: Account number (can be partially masked)
    - institutionName: Name of the bank or financial institution
    - accountHolders: Array of account holder names
    - balance: Current balance as a number
    - accountType: Type of account (checking, savings, etc)
    - statementDate: Statement period end date`,

    investment_statement: `${basePrompt}
    
    Extract these fields from the investment statement:
    - accountNumber: Account number
    - institutionName: Name of the investment firm
    - accountHolders: Array of account holder names
    - balance: Total account value as a number
    - accountType: Type of account (401k, IRA, brokerage, etc)
    - statementDate: Statement date`,

    will_or_trust: `${basePrompt}
    
    Extract these fields from the will or trust document:
    - documentTitle: Title of the document
    - testatorName: Name of the person creating the will
    - executorName: Name of the executor or personal representative
    - trusteeName: Name of the trustee (if trust document)
    - beneficiaries: Array of beneficiary names
    - issueDate: Date the document was created`,

    business_document: `${basePrompt}
    
    Extract these fields from the business document:
    - businessName: Legal name of the business
    - einNumber: Employer Identification Number
    - registrationNumber: State registration or filing number
    - businessType: Type of business entity (LLC, Corporation, etc)
    - registeredAgent: Name of registered agent
    - issueDate: Document issue or filing date`,

    personal_id: `${basePrompt}
    
    Extract these fields from the identification document:
    - fullName: Full legal name
    - dateOfBirth: Date of birth
    - idNumber: Document number (license number, passport number, etc)
    - address: Current address
    - issueDate: Issue date
    - expirationDate: Expiration date`,

    tax_document: `${basePrompt}
    
    Extract these fields from the tax document:
    - documentTitle: Type of tax document (1040, W-2, 1099, etc)
    - taxYear: Tax year as a number
    - fullName: Taxpayer name(s)
    - filingStatus: Filing status if applicable
    - totalIncome: Total income as a number
    - issueDate: Document date`,

    medical_document: `${basePrompt}
    
    Extract these fields from the medical document:
    - patientName: Patient's full name
    - dateOfBirth: Patient's date of birth
    - medicalRecordNumber: Medical record or patient ID
    - physician: Primary physician or doctor name
    - diagnosis: Primary diagnosis if mentioned
    - documentDate: Date of the document`,

    other: `${basePrompt}
    
    Extract any relevant information you can find:
    - documentTitle: Title or type of document
    - names: Any person or organization names
    - dates: Any important dates
    - referenceNumbers: Any reference, account, or ID numbers
    - amounts: Any monetary amounts`
  };

  return categoryPrompts[category] || categoryPrompts.other;
}

function formatUserPrompt(textContent: string, category: DocumentCategory): string {
  // Truncate very long documents to stay within token limits
  const maxLength = 4000;
  const truncatedText = textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '...\n[Document truncated]'
    : textContent;

  return `Please extract the requested information from this ${category.replace(/_/g, ' ')} document:

${truncatedText}

Remember to return ONLY valid JSON with the extracted values.`;
}

function cleanExtractedData(data: Record<string, unknown>, category: DocumentCategory): ExtractedMetadata {
  const cleaned: ExtractedMetadata = {};

  // Copy all valid fields
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      // Clean up common formatting issues
      if (typeof value === 'string') {
        // Remove extra whitespace
        cleaned[key] = value.trim();
        
        // Clean up dates
        if (key.toLowerCase().includes('date') && cleaned[key]) {
          cleaned[key] = normalizeDate(cleaned[key] as string);
        }
      } else if (typeof value === 'number') {
        // Ensure numbers are clean
        cleaned[key] = Number(value);
      } else if (Array.isArray(value)) {
        // Clean array values
        cleaned[key] = value.map(v => 
          typeof v === 'string' ? v.trim() : v
        ).filter(v => v !== null && v !== undefined && v !== '');
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}

function normalizeDate(dateStr: string): string {
  try {
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Return in ISO format (YYYY-MM-DD)
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // If parsing fails, return original string
  }
  return dateStr;
}

// Batch extraction for multiple documents
export async function extractMetadataBatch(
  documents: Array<{ category: DocumentCategory; textContent: string }>,
  apiKey: string,
  options?: {
    maxConcurrent?: number;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<ExtractedMetadata[]> {
  const maxConcurrent = options?.maxConcurrent || 3;
  const results: ExtractedMetadata[] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < documents.length; i += maxConcurrent) {
    const batch = documents.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(doc => extractMetadata(doc.category, doc.textContent, apiKey))
    );
    
    results.push(...batchResults);
    
    if (options?.onProgress) {
      options.onProgress(results.length, documents.length);
    }
  }
  
  return results;
}

