import React, { useState } from 'react';
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
  Landmark,
  Home,
  Briefcase,
  Car,
  Gem,
  Globe,
  Wallet,
  Plus,
  X,
  Info,
  Users,
  Loader2
} from 'lucide-react';
import { AssetCategory, AssetFormData } from '@/types/assets';
import { createAsset } from '@/services/assetService';
import { toast } from 'sonner';

interface AddAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
}

export function AddAssetDialog({ isOpen, onClose, onAssetAdded }: AddAssetDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trustedPerson, setTrustedPerson] = useState('');
  
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: 'financial',
    accessInfo: []
  });

  const categories: { value: AssetCategory; label: string; icon: React.ReactNode }[] = [
    { value: 'financial', label: 'Financial Account', icon: <Landmark className="w-4 h-4" /> },
    { value: 'real-estate', label: 'Real Estate', icon: <Home className="w-4 h-4" /> },
    { value: 'business', label: 'Business Asset', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'vehicles', label: 'Vehicle', icon: <Car className="w-4 h-4" /> },
    { value: 'valuables', label: 'Valuable Item', icon: <Gem className="w-4 h-4" /> },
    { value: 'digital', label: 'Digital Asset', icon: <Globe className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <Wallet className="w-4 h-4" /> },
  ];

  const handleCategorySelect = (category: AssetCategory) => {
    setFormData(prev => ({ ...prev, category }));
    setStep(2);
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
    if (!formData.name.trim()) {
      toast.error('Please provide a name for this possession');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAsset(formData);
      toast.success('Possession added successfully');
      onAssetAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add possession. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ name: '', category: 'financial', accessInfo: [] });
    setTrustedPerson('');
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

      default:
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

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add a New Possession</SheetTitle>
          <SheetDescription>
            {step === 1 
              ? "First, select the category that best describes this possession"
              : "Provide details about this possession to help your loved ones"}
          </SheetDescription>
        </SheetHeader>

        {step === 1 ? (
          // Step 1: Category Selection
          <div className="mt-6 space-y-3">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleCategorySelect(category.value)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {category.icon}
                  </div>
                  <span className="text-left font-medium">{category.label}</span>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          // Step 2: Asset Details
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

            <div className="space-y-2">
              <Label htmlFor="accessInfo">Who Should Have Access?</Label>
              <div className="flex gap-2">
                <Input
                  id="accessInfo"
                  placeholder="e.g., Sarah (Spouse)"
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
                      <Users className="w-3 h-3" />
                      {person}
                      <button
                        onClick={() => handleRemoveTrustedPerson(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
          </div>
        )}

        <SheetFooter className="mt-6 gap-2">
          {step === 2 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              Back
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          {step === 2 && (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Possession
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
