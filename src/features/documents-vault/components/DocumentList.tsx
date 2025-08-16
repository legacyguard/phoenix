import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentRow } from './DocumentRow';
import { Document, DocumentCategory } from '@/types/documents';
import { getDocuments, deleteDocument } from '@/services/documentService';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  FileX,
  SortAsc,
  SortDesc,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentListProps {
  onEdit: (document: Document) => void;
  refreshTrigger?: number;
}

export function DocumentList({ onEdit, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'expiry'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; document: Document | null }>({ isOpen: false, document: null });

  // Load documents on mount and when refreshTrigger changes
  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const loadedDocuments = await getDocuments();
      setDocuments(loadedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to load documents. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.documentNumber?.toLowerCase().includes(term) ||
        doc.issuingAuthority?.toLowerCase().includes(term) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'expiry':
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchTerm, filterCategory, sortBy, sortOrder]);

  const handleView = (document: Document) => {
    // In a real app, this would open a preview modal or navigate to a detail page
    toast.info(`Viewing ${document.name}`);
  };

  const handleDownload = (document: Document) => {
    // In a real app, this would trigger a file download
    toast.info(`Downloading ${document.name}`);
  };

  const handleDelete = (document: Document) => {
    setDeleteDialog({ isOpen: true, document });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.document) return;

    try {
      const success = await deleteDocument(deleteDialog.document.id);
      if (success) {
        toast.success('Document deleted successfully');
        await loadDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to delete document. Please try again.';
      toast.error(message);
    } finally {
      setDeleteDialog({ isOpen: false, document: null });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Get document statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const expiringSoon = documents.filter(doc => {
      if (!doc.expiryDate) return false;
      const daysUntilExpiry = Math.floor(
        (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    }).length;
    const expired = documents.filter(doc => {
      if (!doc.expiryDate) return false;
      return new Date(doc.expiryDate) < new Date();
    }).length;

    return { total, expiringSoon, expired };
  }, [documents]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton for filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-10" />
        </div>
        
        {/* Skeleton for table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-4">
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Alerts */}
      {stats.expiringSoon > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            {stats.expiringSoon} document{stats.expiringSoon !== 1 ? 's' : ''} expiring within 30 days
          </AlertDescription>
        </Alert>
      )}
      {stats.expired > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            {stats.expired} document{stats.expired !== 1 ? 's have' : ' has'} expired
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as DocumentCategory | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'date' | 'expiry')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Added</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="expiry">Expiry Date</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Documents Table */}
      {documents.length === 0 && !searchTerm && filterCategory === 'all' ? (
        <EmptyState
          icon={<FileX />}
          title="No documents yet"
          description="Start building your digital vault by uploading your first important document."
          className="bg-muted/30 rounded-lg py-16"
        />
      ) : filteredAndSortedDocuments.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="No documents found"
          description={searchTerm || filterCategory !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'Upload your first document to get started'}
          className="bg-muted/30 rounded-lg py-16"
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  onView={handleView}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredAndSortedDocuments.length} of {stats.total} document{stats.total !== 1 ? 's' : ''}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, document: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        description={deleteDialog.document ? `Are you sure you want to delete "${deleteDialog.document.name}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
