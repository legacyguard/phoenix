import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Landmark,
  Home,
  Briefcase,
  Car,
  Gem,
  Globe,
  Wallet,
  MoreVertical,
  Edit,
  Eye,
  Trash,
  Shield,
  AlertCircle,
  Lock,
  Users,
  DollarSign
} from 'lucide-react';
import { Asset } from '@/types/assets';
import { Person } from '@/types/people';
import { cn } from '@/lib/utils';
import { EditAssetDialog } from './EditAssetDialog';
import { getPeople } from '@/services/peopleService';

interface AssetCardProps {
  asset: Asset;
  onUpdate: (updates: Partial<Asset>) => void;
  onDelete: () => void;
}

export function AssetCard({ asset, onUpdate, onDelete }: AssetCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [assignedPeople, setAssignedPeople] = useState<Person[]>([]);

  // Load assigned people when component mounts or asset changes
  useEffect(() => {
    loadAssignedPeople();
  }, [asset.assignedPeople]);

  const loadAssignedPeople = async () => {
    if (asset.assignedPeople && asset.assignedPeople.length > 0) {
      try {
        const allPeople = await getPeople();
        const assigned = allPeople.filter(person => 
          asset.assignedPeople?.includes(person.id)
        );
        setAssignedPeople(assigned);
      } catch (error) {
        console.error('Error loading assigned people:', error);
      }
    } else {
      setAssignedPeople([]);
    }
  };

  // Determine if asset needs attention based on assigned people
  const getEffectiveStatus = () => {
    // Critical assets (financial, business, digital) without assignees should be at-risk
    const criticalCategories = ['financial', 'business', 'digital'];
    if (criticalCategories.includes(asset.category) && 
        (!asset.assignedPeople || asset.assignedPeople.length === 0)) {
      return 'at-risk';
    }
    return asset.status;
  };

  const effectiveStatus = getEffectiveStatus();

  // Get icon based on category
  const getCategoryIcon = () => {
    switch (asset.category) {
      case 'financial':
        return <Landmark className="w-5 h-5" />;
      case 'real-estate':
        return <Home className="w-5 h-5" />;
      case 'business':
        return <Briefcase className="w-5 h-5" />;
      case 'vehicles':
        return <Car className="w-5 h-5" />;
      case 'valuables':
        return <Gem className="w-5 h-5" />;
      case 'digital':
        return <Globe className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case 'secured':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Secured
          </Badge>
        );
      case 'needs-attention':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Attention
          </Badge>
        );
      case 'at-risk':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Lock className="w-3 h-3 mr-1" />
            At Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-300 ease-in-out hover:shadow-lg",
          effectiveStatus === 'needs-attention' && "border-amber-200 dark:border-amber-800",
          effectiveStatus === 'at-risk' && "border-red-200 dark:border-red-800"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                effectiveStatus === 'secured' ? "bg-green-100 dark:bg-green-900/20" :
                effectiveStatus === 'needs-attention' ? "bg-amber-100 dark:bg-amber-900/20" :
                effectiveStatus === 'at-risk' ? "bg-red-100 dark:bg-red-900/20" :
                "bg-muted"
              )}>
                {getCategoryIcon()}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">{asset.name}</CardTitle>
                {getStatusBadge()}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Basic Details */}
          <div className="space-y-2">
            {asset.institution && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Institution:</span>
                <span className="font-medium">{asset.institution}</span>
              </div>
            )}
            {asset.accountNumber && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium font-mono">
                  {asset.accountNumber.startsWith('****') ? asset.accountNumber : `****${asset.accountNumber.slice(-4)}`}
                </span>
              </div>
            )}
            {asset.location && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{asset.location}</span>
              </div>
            )}
            {asset.estimatedValue && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">
                  ${asset.estimatedValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Access Information - Show assigned people by name */}
          {assignedPeople.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm mb-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Access granted to:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {assignedPeople.map((person) => (
                  <Badge key={person.id} variant="secondary" className="text-xs">
                    {person.fullName}
                    {person.roles.includes('executor') && ' (Executor)'}
                    {person.roles.includes('beneficiary') && ' (Beneficiary)'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Access Info - for people not in the system */}
          {asset.accessInfo && asset.accessInfo.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm mb-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Additional access notes:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {asset.accessInfo.map((person, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {person}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Details (when toggled) */}
          {showDetails && asset.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {asset.notes}
              </p>
            </div>
          )}

          {/* Warning for items needing attention */}
          {effectiveStatus === 'needs-attention' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
              <p className="text-xs text-amber-900 dark:text-amber-100">
                <span className="font-medium">Action needed:</span>{' '}
                Missing important details for this asset.
              </p>
            </div>
          )}

          {/* Warning for at-risk items */}
          {effectiveStatus === 'at-risk' && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
              <p className="text-xs text-red-900 dark:text-red-100">
                <span className="font-medium">At Risk:</span>{' '}
                {(!asset.assignedPeople || asset.assignedPeople.length === 0)
                  ? 'No trusted person has access to this critical asset.'
                  : 'Critical information missing for this asset.'}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showDetails ? 'Hide' : 'View'} Details
          </Button>
          <Button
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <EditAssetDialog
        asset={asset}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onAssetUpdated={() => onUpdate({})}
        onAssetDeleted={onDelete}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Possession"
        description={`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
