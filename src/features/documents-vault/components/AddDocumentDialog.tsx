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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDocumentSchema, AddDocumentData } from '@/lib/validators/documents';
import { useDocumentStore } from '@/stores/documentStore';

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
  const { addDocument } = useDocumentStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<AddDocumentData>({
    resolver: zodResolver(addDocumentSchema),
    defaultValues: {
      name: '',
      category: 'personal',
      status: 'active'
    }
  });

  const watchedName = watch('name');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill document name if empty
      if (!watchedName) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setValue('name', nameWithoutExtension);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: AddDocumentData) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await addDocument(data, selectedFile);
      toast.success('Document uploaded successfully');
      onDocumentAdded();
      handleClose();
    } catch (error) {
      console.error('Error creating document:', error);
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to upload document. Please try again.';
      toast.error(message);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    reset();
    onClose();
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

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              onValueChange={(value) => setValue('category', value as DocumentCategory)}
            >
              <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
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
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
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
              {...register('documentNumber')}
              className={errors.documentNumber ? 'border-red-500' : ''}
            />
            {errors.documentNumber && (
              <p className="text-xs text-red-500">{errors.documentNumber.message}</p>
            )}
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
              {...register('issuingAuthority')}
              className={errors.issuingAuthority ? 'border-red-500' : ''}
            />
            {errors.issuingAuthority && (
              <p className="text-xs text-red-500">{errors.issuingAuthority.message}</p>
            )}
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
                {...register('issueDate')}
                className={errors.issueDate ? 'border-red-500' : ''}
              />
              {errors.issueDate && (
                <p className="text-xs text-red-500">{errors.issueDate.message}</p>
              )}
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
                {...register('expiryDate')}
                className={errors.expiryDate ? 'border-red-500' : ''}
              />
              {errors.expiryDate && (
                <p className="text-xs text-red-500">{errors.expiryDate.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this document..."
              {...register('notes')}
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Privacy Notice */}
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
              Your document will be encrypted and stored securely. Only you and your designated 
              trusted people will have access to this document.
            </AlertDescription>
          </Alert>
        </form>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Document
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
