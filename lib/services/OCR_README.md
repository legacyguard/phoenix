# OCR Integration for LegacyGuard

Privacy-first document processing with Tesseract.js for local text extraction and optional AI enhancement.

## Overview

This OCR integration provides a hybrid approach to document processing:
- 🔒 **100% Local Processing**: All OCR happens in the browser
- 🌍 **Multi-language Support**: Optimized for Czech, Slovak, and English
- 🤖 **Optional AI Enhancement**: Anonymized text can be sent for better analysis
- 📱 **Offline Capable**: Results stored in IndexedDB for offline access

## Architecture

### Core Components

1. **OCR Service** (`ocr.service.ts`)
   - Browser-based text extraction using Tesseract.js
   - Document type detection with Czech/Slovak patterns
   - Image preprocessing for better accuracy
   - Text anonymization for privacy

2. **Document Patterns** (`ocr.patterns.ts`)
   - Czech/Slovak document recognition patterns
   - Support for insurance, banking, property, and ID documents
   - Language detection algorithms

3. **Document Preprocessor** (`document-preprocessor.ts`)
   - Image enhancement (contrast, noise reduction)
   - Binarization for better OCR accuracy
   - Text anonymization utilities

4. **React Hook** (`useOCR.ts`)
   - Simple interface for components
   - Progress tracking with empathetic messages
   - IndexedDB integration for offline storage

## Usage

### Basic OCR Processing

```typescript
import { useOCR } from '@/lib/hooks/useOCR';

function DocumentScanner() {
  const { 
    processDocument, 
    isProcessing, 
    progress, 
    progressMessage,
    isPrivacyMode,
    setPrivacyMode 
  } = useOCR();

  const handleScan = async (file: File) => {
    const result = await processDocument(file, {
      localOnly: true, // Force local processing
      preprocessImage: true, // Enhance image quality
    });

    if (result) {
      console.log('Document type:', result.documentType);
      console.log('Extracted text:', result.text);
      console.log('Structured data:', result.structuredData);
    }
  };
}
```

### Hybrid Processing (OCR + AI)

```typescript
const { processDocument, anonymizeText } = useOCR();
const { analyzeDocument } = useAI();

const handleHybridProcessing = async (file: File) => {
  // Step 1: Local OCR
  const ocrResult = await processDocument(file);
  
  // Step 2: Check if AI enhancement needed
  if (ocrResult.documentType.confidence < 0.8) {
    // Step 3: Anonymize sensitive data
    const anonymized = anonymizeText(ocrResult.text, {
      preserveStructure: true,
      preserveDates: true,
    });
    
    // Step 4: Send anonymized text to AI
    const enhanced = await analyzeDocument(anonymized.text);
  }
};
```

## Supported Document Types

### Czech Documents
- **Pojistná smlouva** (Insurance Policy)
- **Výpis z účtu** (Bank Statement)
- **List vlastnictví** (Property Deed)
- **Občanský průkaz** (Identity Card)
- **Závěť** (Will)
- **Lékařská zpráva** (Medical Record)

### Slovak Documents
- **Poistná zmluva** (Insurance Policy)
- **Výpis z účtu** (Bank Statement)
- **List vlastníctva** (Property Deed)
- **Občiansky preukaz** (Identity Card)

## Privacy Features

### 1. Local-Only Mode
```typescript
// All processing stays in browser
const result = await processDocument(file, {
  localOnly: true
});
```

### 2. Text Anonymization
```typescript
const anonymized = anonymizeText(text, {
  preserveStructure: true,  // Keep document format
  preserveDates: false,     // Remove dates
  preserveAmounts: false,   // Remove financial data
});

// Result:
// Original: "Jan Novák, born 15.3.1980, account 1234/5678"
// Anonymized: "[NAME], born [DATE], account [REMOVED]"
```

### 3. IndexedDB Storage
- OCR results stored locally
- No server synchronization
- Accessible offline

## Performance Optimization

### Image Preprocessing
- Automatic contrast enhancement
- Noise reduction
- Binarization for text clarity
- Smart resizing (max 2400x3200)

### Processing Speed
- Average document: 3-5 seconds
- Preprocessing adds ~1 second
- Cached language data for faster subsequent scans

## Configuration

### Language Support
```typescript
// Default: Auto-detect
const result = await processDocument(file);

// Force specific language
const result = await processDocument(file, {
  language: 'cs' // Czech
});
```

### Progress Tracking
```typescript
const result = await processDocument(file, {
  onProgress: (progress) => {
    console.log(progress.message); // User-friendly message
    console.log(progress.progress); // 0-100
  }
});
```

## Error Handling

All errors include user-friendly messages:

```typescript
try {
  const result = await processDocument(file);
} catch (error) {
  // error.userMessage: "Having trouble reading this document. Try taking a clearer photo?"
  // error.code: 'processing_failed'
}
```

## Testing

```bash
# Run OCR tests
npm test lib/services/__tests__/ocr.service.test.ts
```

## Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

Note: Requires modern browser with WebAssembly support.

## Best Practices

1. **Image Quality**
   - Use well-lit, clear photos
   - Avoid shadows and glare
   - Keep text straight (not angled)

2. **Privacy**
   - Default to privacy mode for sensitive documents
   - Only enable AI enhancement when needed
   - Review anonymized text before cloud processing

3. **Performance**
   - Process one document at a time
   - Use smaller images when possible
   - Enable preprocessing for poor quality scans

## Future Enhancements

- [ ] PDF support (currently image-only)
- [ ] Handwriting recognition
- [ ] Multi-page document support
- [ ] Batch processing
- [ ] More language support (German, Polish)

## Troubleshooting

### "Could not read your document"
- Ensure image is clear and text is legible
- Try enabling image preprocessing
- Check file size (max 50MB)

### Slow processing
- Reduce image size
- Disable preprocessing if not needed
- Check browser console for errors

### Wrong document type detected
- Ensure document is in supported language
- Check if key patterns are visible
- Manual type selection coming soon
