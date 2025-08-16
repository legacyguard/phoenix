import React, { useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentFormData, DocumentCategory } from '@/types/documents';
import { createDocument } from '@/services/documentService';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  X,
  Info,
  Calendar,
  Building,
  Hash,
  Loader2,
  FileUp
} from 'lucide-react';
import { formatFileSize } from '@/services/documentService';
import { useDialogStateWithFields } from '@/hooks/useDialogState';

interface AddDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: () => void;
}

export function AddDocumentDialog({
  isOpen,
  onClose,
  onDocumentAdded
}: AddDocumentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  
  const {
    formData,
    updateFormData,
    handleInputChange,
    isSubmitting,
    setIsSubmitting,
    handleClose: resetAndClose
  } = useDialogStateWithFields<DocumentFormData>(
    {
      name: '',
      category: 'personal',
      status: 'active'
    },
    onClose
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      // Auto-fill document name if empty
      if (!formData.name) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        updateFormData({ name: nameWithoutExtension });
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Please provide a document name');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDocument(formData, selectedFile);
      toast.success('Document uploaded successfully');
      onDocumentAdded();
      handleClose();
    } catch (error) {
      console.error('Error creating document:', error);
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to upload document. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    resetAndClose();
  };

  const categoryOptions: { value: DocumentCategory; label: string }[] = [
    { value: 'personal', label: 'Personal' },
    { value: 'financial', label: 'Financial' },
    { value: 'legal', label: 'Legal' },
    { value: 'medical', label: 'Medical' },
    { value: 'property', label: 'Property' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Upload Important Document</SheetTitle>
          <SheetDescription>
            Securely store your important papers in your digital vault
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File *</Label>
            <div className="space-y-2">
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-all duration-300 ease-in-out cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
            </div>
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Passport - John Doe"
              value={formData.name}
              onChange={handleInputChange('name')}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateFormData({ category: value as DocumentCategory })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <Label htmlFor="documentNumber">
              <Hash className="inline h-3 w-3 mr-1" />
              Document Number
            </Label>
            <Input
              id="documentNumber"
              placeholder="e.g., N12345678 (Passport number, policy number, etc.)"
              value={formData.documentNumber || ''}
              onChange={handleInputChange('documentNumber')}
            />
          </div>

          {/* Issuing Authority */}
          <div className="space-y-2">
            <Label htmlFor="issuingAuthority">
              <Building className="inline h-3 w-3 mr-1" />
              Issuing Authority
            </Label>
            <Input
              id="issuingAuthority"
              placeholder="e.g., U.S. Department of State"
              value={formData.issuingAuthority || ''}
              onChange={handleInputChange('issuingAuthority')}
            />
          </div>

          {/* Issue Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">
                <Calendar className="inline h-3 w-3 mr-1" />
                Issue Date
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate || ''}
                onChange={handleInputChange('issueDate')}
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                <Calendar className="inline h-3 w-3 mr-1" />
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate || ''}
                onChange={handleInputChange('expiryDate')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this document..."
              value={formData.notes || ''}
              onChange={handleInputChange('notes')}
              rows={3}
            />
          </div>

          {/* Privacy Notice */}
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
              Your document will be encrypted and stored securely. Only you and your designated 
              trusted people will have access to this document.
            </AlertDescription>
          </Alert>
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile || !formData.name.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Document
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
