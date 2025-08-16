import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentList } from '@/features/documents-vault/components/DocumentList';
import { AddDocumentDialog } from '@/features/documents-vault/components/AddDocumentDialog';
import { Document } from '@/types/documents';
import { useDocumentStore } from '@/stores/documentStore';
import {
  FileText,
  Upload,
  Shield,
  Info,
  Lock,
  FileKey
} from 'lucide-react';

export function ImportantPapersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { fetchDocuments } = useDocumentStore();

  const handleDocumentAdded = () => {
    // Refresh documents from store
    fetchDocuments();
  };

  const handleEditDocument = (document: Document) => {
    // In a real app, this would open an edit dialog
    // For now, we'll just set the selected document
    setSelectedDocument(document);
    console.log('Edit document:', document);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileKey className="h-8 w-8 text-primary" />
              Your Important Papers
            </h1>
            <p className="text-muted-foreground mt-2">
              Securely store and organize your critical documents in one place
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            All documents are encrypted and stored securely. Only you and your designated trusted people have access.
          </span>
          <Lock className="h-4 w-4 text-primary ml-2" />
        </AlertDescription>
      </Alert>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personal</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Financial</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Legal</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-card border rounded-lg p-6">
        <DocumentList 
          onEdit={handleEditDocument}
        />
      </div>

      {/* Add Document Dialog */}
      <AddDocumentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onDocumentAdded={handleDocumentAdded}
      />

      {/* Tips Section */}
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Tips for Document Management</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Keep documents current</p>
              <p className="text-sm text-muted-foreground">
                Regularly review and update expired documents like passports and licenses
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Organize with categories</p>
              <p className="text-sm text-muted-foreground">
                Use consistent categories to make documents easy to find when needed
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Include document numbers</p>
              <p className="text-sm text-muted-foreground">
                Add reference numbers for quick identification and verification
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Set expiry reminders</p>
              <p className="text-sm text-muted-foreground">
                Track expiry dates to ensure important documents are renewed on time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
