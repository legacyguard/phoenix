import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  X,
  Info,
  Users,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Asset, AssetFormData } from '@/types/assets';
import { Person } from '@/types/people';
import { updateAsset, deleteAsset } from '@/services/assetService';
import { getPeople } from '@/services/peopleService';
import PersonSelector from './PersonSelector';
import { toast } from 'sonner';

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onAssetUpdated: () => void;
  onAssetDeleted: () => void;
}

export function EditAssetDialog({ 
  isOpen, 
  onClose, 
  asset, 
  onAssetUpdated,
  onAssetDeleted 
}: EditAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [trustedPerson, setTrustedPerson] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [assignedPeopleIds, setAssignedPeopleIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: 'financial',
    accessInfo: []
  });

  // Load asset data when dialog opens or asset changes
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        category: asset.category,
        institution: asset.institution,
        accountNumber: asset.accountNumber,
        accountType: asset.accountType,
        address: asset.address,
        propertyType: asset.propertyType,
        location: asset.location,
        estimatedValue: asset.estimatedValue,
        notes: asset.notes,
        accessInfo: asset.accessInfo || []
      });
      setAssignedPeopleIds(asset.assignedPeople || []);
    }
  }, [asset]);

  // Load people when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadPeople();
    }
  }, [isOpen]);

  const loadPeople = async () => {
    try {
      const loadedPeople = await getPeople();
      setPeople(loadedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
      toast.error('Failed to load trusted people');
    }
  };

  const handleAddTrustedPerson = () => {
    if (trustedPerson.trim()) {
      setFormData(prev => ({
        ...prev,
        accessInfo: [...(prev.accessInfo || []), trustedPerson.trim()]
      }));
      setTrustedPerson('');
    }
  };

  const handleRemoveTrustedPerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accessInfo: prev.accessInfo?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async () => {
    if (!asset) return;
    
    if (!formData.name.trim()) {
      toast.error('Please provide a name for this possession');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedAsset = {
        ...formData,
        assignedPeople: assignedPeopleIds
      };
      await updateAsset(asset.id, updatedAsset);
      toast.success('Possession updated successfully');
      onAssetUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update possession. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;

    setIsDeleting(true);
    try {
      await deleteAsset(asset.id);
      toast.success('Possession deleted successfully');
      onAssetDeleted();
      handleClose();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete possession. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', category: 'financial', accessInfo: [] });
    setTrustedPerson('');
    setAssignedPeopleIds([]);
    setShowDeleteDialog(false);
    onClose();
  };

  const renderCategoryFields = () => {
    switch (formData.category) {
      case 'financial':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="institution">Financial Institution</Label>
              <Input
                id="institution"
                placeholder="e.g., Bank of America, Vanguard"
                value={formData.institution || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number (last 4 digits)</Label>
              <Input
                id="accountNumber"
                placeholder="****1234"
                value={formData.accountNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select 
                value={formData.accountType || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
              >
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="retirement">Retirement (401k/IRA)</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'real-estate':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, City, State"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select 
                value={formData.propertyType || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-family">Single Family Home</SelectItem>
                  <SelectItem value="condo">Condominium</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="multi-family">Multi-Family</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'vehicles':
      case 'valuables':
      case 'business':
      case 'digital':
      case 'other':
        return (
          <div className="space-y-2">
            <Label htmlFor="location">Location / Storage</Label>
            <Input
              id="location"
              placeholder="Where is this item located or stored?"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        );
    }
  };

  if (!asset) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Possession</SheetTitle>
            <SheetDescription>
              Update the details of this possession to keep information current
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name / Description *</Label>
              <Input
                id="name"
                placeholder="e.g., Primary Checking Account, Family Home"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
            </div>

            {renderCategoryFields()}

            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value</Label>
              <Input
                id="value"
                type="number"
                placeholder="0"
                value={formData.estimatedValue || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimatedValue: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
              />
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Access & Beneficiaries</h3>
              </div>
              
              <PersonSelector
                people={people}
                selectedPeopleIds={assignedPeopleIds}
                onSelectionChange={setAssignedPeopleIds}
              />

              {/* Keep legacy text-based access info for display purposes */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="accessInfo">Additional Access Notes (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="accessInfo"
                    placeholder="e.g., Financial Advisor - John Smith"
                    value={trustedPerson}
                    onChange={(e) => setTrustedPerson(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTrustedPerson())}
                  />
                  <Button type="button" onClick={handleAddTrustedPerson} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.accessInfo && formData.accessInfo.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.accessInfo.map((person, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Info className="w-3 h-3" />
                        {person}
                        <button
                          onClick={() => handleRemoveTrustedPerson(index)}
                          className="ml-1 hover:text-red-600 transition-all duration-300 ease-in-out"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Use this field for people not yet in your trusted circle or additional notes about access.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any important details your loved ones should know..."
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                This information will be encrypted and stored securely. Only your designated trusted people will have access when needed.
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Possession
              </Button>
            </div>
          </div>

          <SheetFooter className="mt-6 gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Possession
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{asset.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
