import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  FileImage,
  File,
  MoreVertical,
  Eye,
  Download,
  Edit,
  Trash,
  Clock,
  AlertCircle,
  CheckCircle,
  Archive,
  Calendar,
  Shield,
  GraduationCap,
  Heart,
  Home,
  Briefcase,
  User
} from 'lucide-react';
import { Document, DocumentCategory } from '@/types/documents';
import { formatFileSize } from '@/services/documentService';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface DocumentRowProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onDownload: (document: Document) => void;
}

export function DocumentRow({
  document,
  onView,
  onEdit,
  onDelete,
  onDownload
}: DocumentRowProps) {
  // Get the appropriate icon for the file type
  const getFileIcon = () => {
    if (!document.file) return <File className="h-4 w-4" />;
    
    const type = document.file.type;
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-600" />;
    if (type.includes('image')) return <FileImage className="h-4 w-4 text-blue-600" />;
    return <File className="h-4 w-4 text-gray-600" />;
  };

  // Get category icon and color
  const getCategoryConfig = (category: DocumentCategory) => {
    switch (category) {
      case 'personal':
        return { icon: <User className="h-3 w-3" />, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'financial':
        return { icon: <Briefcase className="h-3 w-3" />, color: 'text-green-600', bg: 'bg-green-100' };
      case 'legal':
        return { icon: <Shield className="h-3 w-3" />, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'medical':
        return { icon: <Heart className="h-3 w-3" />, color: 'text-red-600', bg: 'bg-red-100' };
      case 'property':
        return { icon: <Home className="h-3 w-3" />, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'education':
        return { icon: <GraduationCap className="h-3 w-3" />, color: 'text-cyan-600', bg: 'bg-cyan-100' };
      default:
        return { icon: <File className="h-3 w-3" />, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    // Check if document is expired or expiring soon
    if (document.expiryDate) {
      const today = new Date();
      const expiryDate = new Date(document.expiryDate);
      const thirtyDaysFromNow = addDays(today, 30);
      
      if (isBefore(expiryDate, today)) {
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      } else if (isBefore(expiryDate, thirtyDaysFromNow)) {
        return (
          <Badge variant="warning" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Expires Soon
          </Badge>
        );
      }
    }

    switch (document.status) {
      case 'active':
        return (
          <Badge variant="success" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="secondary" className="text-xs">
            <Archive className="h-3 w-3 mr-1" />
            Archived
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const categoryConfig = getCategoryConfig(document.category);

  return (
    <TableRow className="transition-all duration-300 ease-in-out hover:bg-muted/50">
      {/* Document Name with Icon */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{document.name}</p>
            {document.documentNumber && (
              <p className="text-xs text-muted-foreground">#{document.documentNumber}</p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
          {categoryConfig.icon}
          <span className="capitalize">{document.category}</span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        {getStatusBadge()}
      </TableCell>

      {/* Date Added */}
      <TableCell>
        <div className="text-sm">
          {format(new Date(document.createdAt), 'MMM d, yyyy')}
        </div>
        {document.expiryDate && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            Expires: {format(new Date(document.expiryDate), 'MMM d, yyyy')}
          </div>
        )}
      </TableCell>

      {/* File Size */}
      <TableCell>
        {document.file && (
          <span className="text-sm text-muted-foreground">
            {formatFileSize(document.file.size)}
          </span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(document)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(document)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(document)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(document)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
