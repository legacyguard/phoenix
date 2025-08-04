import jsPDF from 'jspdf';
import type { WillContent, WillRequirements } from '@/types/will';
import { getLegacyGuardSignatureSVG } from '@/components/LegacyGuardSignature.utils';

export class PDFGenerationService {
  generateWillPDF(
    willContent: WillContent, 
    requirements: WillRequirements,
    countryCode: string,
    includeSignature: boolean = false,
    signatureData?: { signerName?: string; documentId?: string }
  ): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Helper functions
    const addText = (text: string, fontSize: number = 12, align: 'left' | 'center' | 'right' = 'left') => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      
      if (align === 'center') {
        lines.forEach((line: string) => {
          const textWidth = doc.getTextWidth(line);
          doc.text(line, (pageWidth - textWidth) / 2, yPosition);
          yPosition += fontSize * 0.4;
        });
      } else {
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.4;
      }
    };
    
    const checkPageBreak = (requiredSpace: number = 30) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };
    
    // Title
    addText(requirements.legal_language.title, 20, 'center');
    yPosition += 10;
    
    // Identity clause
    const identityText = requirements.legal_language.identity
      .replace('{name}', willContent.testator.name || '')
      .replace('{birthDate}', willContent.testator.birthDate || '')
      .replace('{address}', willContent.testator.address || '');
    
    addText(identityText + (requirements.legal_language.soundMind ? `, ${requirements.legal_language.soundMind}` : ''), 12);
    yPosition += 5;
    
    // Revocation clause
    addText(requirements.legal_language.revocation, 12);
    yPosition += 10;
    
    // Beneficiaries
    addText(`${requirements.legal_language.beneficiaries}:`, 14);
    yPosition += 5;
    
    willContent.beneficiaries.forEach((beneficiary, index) => {
      checkPageBreak();
      
      addText(`${index + 1}. ${beneficiary.name} (${beneficiary.relationship})${beneficiary.identification ? ` - ${beneficiary.identification}` : ''}`, 12);
      
      beneficiary.allocation.forEach(alloc => {
        const allocText = alloc.assetType === 'percentage' 
          ? `   - ${alloc.value}% of estate`
          : `   - ${alloc.description}`;
        addText(allocText, 11);
      });
      
      if (beneficiary.alternativeBeneficiary) {
        addText(`   Alternative: ${beneficiary.alternativeBeneficiary}`, 10);
      }
      
      yPosition += 5;
    });
    
    // Executor
    if (willContent.executor) {
      checkPageBreak();
      yPosition += 5;
      addText('Executor:', 14);
      addText(`${willContent.executor.name} (${willContent.executor.relationship})`, 12);
      addText(willContent.executor.address, 11);
      if (willContent.executor.phone) {
        addText(willContent.executor.phone, 11);
      }
      
      if (willContent.executor.alternativeExecutor) {
        yPosition += 3;
        addText('Alternative Executor:', 12);
        addText(`${willContent.executor.alternativeExecutor.name} (${willContent.executor.alternativeExecutor.relationship})`, 11);
      }
    }
    
    // Special bequests
    if (willContent.specialBequests && willContent.specialBequests.length > 0) {
      checkPageBreak();
      yPosition += 10;
      addText('Special Bequests:', 14);
      
      willContent.specialBequests.forEach((bequest, index) => {
        addText(`${index + 1}. ${bequest.description}`, 12);
        if (bequest.beneficiary) {
          addText(`   To: ${bequest.beneficiary}`, 11);
        }
        if (bequest.condition) {
          addText(`   Condition: ${bequest.condition}`, 11);
        }
        yPosition += 3;
      });
    }
    
    // Signature section
    checkPageBreak(80);
    yPosition = pageHeight - 100;
    
    // Date and place
    doc.text(`${requirements.legal_language.date}: ______________`, margin, yPosition);
    doc.text('Place: ______________', pageWidth - margin - 60, yPosition);
    
    // Testator signature
    yPosition += 20;
    doc.text('_________________________________', (pageWidth - 150) / 2, yPosition);
    yPosition += 5;
    addText(requirements.legal_language.signature, 10, 'center');
    
    // Witnesses section
    if (requirements.witness_count > 0) {
      doc.addPage();
      yPosition = margin;
      addText('Witnesses:', 16, 'center');
      yPosition += 10;
      
      for (let i = 0; i < requirements.witness_count; i++) {
        if (i > 0 && i % 2 === 0) {
          checkPageBreak(60);
        }
        
        const xPos = (i % 2 === 0) ? margin : pageWidth / 2 + 10;
        const baseY = yPosition;
        
        doc.text(`${requirements.legal_language.witness} ${i + 1}:`, xPos, baseY);
        doc.text('Name: _______________________', xPos, baseY + 10);
        doc.text('Signature: ___________________', xPos, baseY + 20);
        doc.text('Address: ____________________', xPos, baseY + 30);
        doc.text('Date: _______________________', xPos, baseY + 40);
        
        if (i % 2 === 1) {
          yPosition += 60;
        }
      }
    }
    
    // Add signature stamp if requested
    if (includeSignature && signatureData) {
      // Add a new page for signature
      doc.addPage();
      yPosition = margin;
      
      // Add signature stamp
      addText('Document Authentication', 16, 'center');
      yPosition += 20;
      
      // Create signature SVG
      const signatureSVG = getLegacyGuardSignatureSVG({
        date: new Date().toISOString(),
        signerName: signatureData.signerName || willContent.testator.name,
        documentId: signatureData.documentId
      });
      
      // Convert SVG to image and add to PDF
      const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(signatureSVG)));
      
      // Add the signature image (centered)
      const imgWidth = 120;
      const imgHeight = 60;
      const xPos = (pageWidth - imgWidth) / 2;
      
      try {
        doc.addImage(svgBase64, 'SVG', xPos, yPosition, imgWidth, imgHeight);
      } catch (error) {
        // Fallback to text if SVG fails
        yPosition += 10;
        addText('Digitally Signed by LegacyGuard', 12, 'center');
        addText(`Signer: ${signatureData.signerName || willContent.testator.name}`, 10, 'center');
        addText(`Date: ${new Date().toLocaleDateString()}`, 10, 'center');
        addText(`Document ID: ${signatureData.documentId?.substring(0, 8) || 'N/A'}`, 10, 'center');
      }
      
      yPosition += imgHeight + 20;
      
      // Add legal text
      addText('This document has been digitally signed and authenticated by the LegacyGuard platform.', 10, 'center');
      addText('The digital signature confirms the identity of the signer and the integrity of the document.', 10, 'center');
    }
    
    // Add metadata
    doc.setProperties({
      title: `Last Will and Testament - ${willContent.testator.name}`,
      subject: `Will for ${countryCode}`,
      author: 'LegacyGuard',
      keywords: 'will, testament, estate planning',
      creator: 'LegacyGuard Platform'
    });
    
    return doc.output('blob');
  }
}

export const pdfGenerationService = new PDFGenerationService();
