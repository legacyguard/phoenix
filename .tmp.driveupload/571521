import { ClassificationResult, DocumentCategory } from '../types/document-ai';

// Document classification using OpenAI's GPT-4 Vision
export async function classifyDocument(
  documentImageUrl: string,
  apiKey: string
): Promise<ClassificationResult> {
  try {
    // Validate input
    if (!documentImageUrl) {
      throw new Error('Document image URL is required');
    }

    // Prepare the prompt for document classification
    const systemPrompt = `You are an expert paralegal specializing in estate planning and family asset protection. 
    Your task is to classify document images into specific categories that are critical for family emergency preparedness and legacy planning.
    
    Analyze the document's visual structure, headers, logos, forms, and key textual elements to determine its type.
    Focus on accuracy and practical utility for families organizing their important documents.
    
    Categories:
    - insurance_policy: Life, health, home, auto, disability insurance policies. Look for policy numbers, coverage amounts, premium information.
    - property_deed: Property ownership documents, deeds, titles. Look for legal descriptions, parcel numbers, recording stamps.
    - vehicle_title: Car, boat, motorcycle ownership documents. Look for VIN numbers, make/model information.
    - bank_statement: Bank account statements, savings/checking documents. Look for account numbers, transaction lists, bank logos.
    - investment_statement: Brokerage, 401k, IRA, investment account statements. Look for portfolio summaries, account values.
    - will_or_trust: Last will and testament, living trusts, estate planning documents. Look for legal language, beneficiary information.
    - business_document: Articles of incorporation, operating agreements, business contracts. Look for business names, EIN numbers.
    - personal_id: Government-issued IDs, passports, birth certificates, SSN cards. Look for photos, official seals.
    - tax_document: Tax returns (1040, etc.), W-2s, 1099s, tax assessments. Look for tax year, IRS forms.
    - medical_document: Medical records, advance directives, healthcare POA. Look for patient information, medical terminology.
    - other: Important documents that don't clearly fit above categories.
    
    Your response must be valid JSON with exactly these fields:
    {
      "category": "[one of the categories above]",
      "confidence": [number between 0 and 1],
      "reasoning": "[brief explanation of classification logic]",
      "suggestedTitle": "[human-friendly document title]"
    }`;

    const userPrompt = `Please classify this document image. Examine all visual elements including:
    - Document header and title
    - Company or institution logos
    - Form numbers or document identifiers
    - Key sections and data fields
    - Legal language or technical terminology
    - Overall document structure and layout
    
    Provide your classification in the specified JSON format.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: documentImageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for more consistent classification
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, try to extract information from the text
      result = parseTextResponse(content);
    }

    // Validate and normalize the result
    const classification: ClassificationResult = {
      category: validateCategory(result.category) || 'other',
      confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
      reasoning: result.reasoning || result.explanation || 'Unable to determine reasoning',
      suggestedTitle: result.suggestedTitle || result.title || generateDefaultTitle(result.category)
    };

    return classification;

  } catch (error) {
    console.error('Document classification error:', error);
    
    // Return a fallback classification
    return {
      category: 'other',
      confidence: 0,
      reasoning: `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Helper function to validate category
function validateCategory(category: string): DocumentCategory | null {
  const validCategories: DocumentCategory[] = [
    'insurance_policy',
    'property_deed',
    'vehicle_title',
    'bank_statement',
    'investment_statement',
    'will_or_trust',
    'business_document',
    'personal_id',
    'tax_document',
    'medical_document',
    'other'
  ];
  
  const normalized = category?.toLowerCase().replace(/\s+/g, '_');
  return validCategories.includes(normalized as DocumentCategory) 
    ? normalized as DocumentCategory 
    : null;
}

// Helper function to parse text response if JSON parsing fails
function parseTextResponse(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {
    category: 'other',
    confidence: 0.5,
    reasoning: text
  };

  // Try to extract category
  const categoryMatch = text.match(/category[:\s]+([a-z_]+)/i);
  if (categoryMatch) {
    result.category = categoryMatch[1];
  }

  // Try to extract confidence
  const confidenceMatch = text.match(/confidence[:\s]+([0-9.]+)/i);
  if (confidenceMatch) {
    result.confidence = parseFloat(confidenceMatch[1]);
  }

  return result;
}

// Helper function to generate default titles
function generateDefaultTitle(category: DocumentCategory): string {
  const titleMap: Record<DocumentCategory, string> = {
    insurance_policy: 'Insurance Policy Document',
    property_deed: 'Property Ownership Document',
    vehicle_title: 'Vehicle Title Document',
    bank_statement: 'Bank Account Document',
    investment_statement: 'Investment Account Document',
    will_or_trust: 'Estate Planning Document',
    business_document: 'Business Document',
    personal_id: 'Personal Identification',
    tax_document: 'Tax Document',
    medical_document: 'Medical Document',
    other: 'Important Document'
  };
  
  return titleMap[category] || 'Document';
}

// Alternative implementation using base64 encoded images
export async function classifyDocumentFromBase64(
  documentBase64: string,
  mimeType: string,
  apiKey: string
): Promise<ClassificationResult> {
  const dataUrl = `data:${mimeType};base64,${documentBase64}`;
  return classifyDocument(dataUrl, apiKey);
}

// Batch classification for multiple documents
export async function classifyDocumentsBatch(
  documentUrls: string[],
  apiKey: string,
  options?: {
    maxConcurrent?: number;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<ClassificationResult[]> {
  const maxConcurrent = options?.maxConcurrent || 3;
  const results: ClassificationResult[] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < documentUrls.length; i += maxConcurrent) {
    const batch = documentUrls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => classifyDocument(url, apiKey))
    );
    
    results.push(...batchResults);
    
    if (options?.onProgress) {
      options.onProgress(results.length, documentUrls.length);
    }
  }
  
  return results;
}
