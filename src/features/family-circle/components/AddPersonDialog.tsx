import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart,
  Users,
  Briefcase,
  UserCheck,
  Info,
  Loader2,
  Calendar
} from 'lucide-react';
import { PersonFormData, PersonRelationship, PersonRole } from '@/types/people';
import { toast } from 'sonner';
import { PersonSchema } from '@/lib/validators/people';
import { useFormValidation } from '@/hooks/useFormValidation';
import { usePeopleStore } from '@/stores/peopleStore';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonAdded: () => void;
}

export function AddPersonDialog({ isOpen, onClose, onPersonAdded }: AddPersonDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addPerson } = usePeopleStore();
  
  const {
    formData,
    errors,
    updateField,
    validateForm,
    reset,
    setFormData
  } = useFormValidation(PersonSchema, {
    fullName: '',
    relationship: 'friend' as PersonRelationship,
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    roles: [],
    notes: ''
  });

  const relationships: { value: PersonRelationship; label: string; icon: React.ReactNode }[] = [
    { value: 'spouse', label: 'Spouse', icon: <Heart className="w-4 h-4" /> },
    { value: 'child', label: 'Child', icon: <Users className="w-4 h-4" /> },
    { value: 'parent', label: 'Parent', icon: <Users className="w-4 h-4" /> },
    { value: 'sibling', label: 'Sibling', icon: <Users className="w-4 h-4" /> },
    { value: 'grandchild', label: 'Grandchild', icon: <Users className="w-4 h-4" /> },
    { value: 'friend', label: 'Friend', icon: <UserCheck className="w-4 h-4" /> },
    { value: 'professional', label: 'Professional', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <Users className="w-4 h-4" /> },
  ];

  const roles: { value: PersonRole; label: string; description: string }[] = [
    { 
      value: 'executor', 
      label: 'Executor', 
      description: 'Will execute your estate plans'
    },
    { 
      value: 'guardian', 
      label: 'Guardian', 
      description: 'Will care for minor children'
    },
    { 
      value: 'beneficiary', 
      label: 'Beneficiary', 
      description: 'Will inherit assets'
    },
    { 
      value: 'power-of-attorney', 
      label: 'Power of Attorney', 
      description: 'Can make financial decisions'
    },
    { 
      value: 'healthcare-proxy', 
      label: 'Healthcare Proxy', 
      description: 'Can make medical decisions'
    },
    { 
      value: 'trustee', 
      label: 'Trustee', 
      description: 'Will manage trusts'
    },
    { 
      value: 'emergency-contact', 
      label: 'Emergency Contact', 
      description: 'Should be contacted in emergencies'
    },
  ];

  const handleRoleToggle = (role: PersonRole) => {
    const newRoles = formData.roles.includes(role)
      ? formData.roles.filter(r => r !== role)
      : [...formData.roles, role];
    updateField('roles', newRoles);
  };

  const handleSubmit = async () => {
    // Validate the form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPerson(formData);
      toast.success('Person added successfully');
      onPersonAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding person:', error);
      toast.error('Failed to add person. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add a Person to Your Circle</SheetTitle>
          <SheetDescription>
            Add someone important to your legacy planning - family, friends, or professionals who will play a role in your plans.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="e.g., Sarah Johnson"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                autoFocus
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Select 
                value={formData.relationship} 
                onValueChange={(value) => updateField('relationship', value as PersonRelationship)}
              >
                <SelectTrigger 
                  id="relationship"
                  className={errors.relationship ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel.value} value={rel.value}>
                      <div className="flex items-center gap-2">
                        {rel.icon}
                        <span>{rel.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.relationship && (
                <p className="text-xs text-red-500">{errors.relationship}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, City, State"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  className={`pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          {/* Roles & Responsibilities */}
          <div className="space-y-2">
            <Label>Roles & Responsibilities</Label>
            <p className="text-sm text-muted-foreground">
              Select all roles this person will have in your legacy planning
            </p>
            <div className="space-y-2 mt-3">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-all duration-300 ease-in-out"
                >
                  <Checkbox
                    id={role.value}
                    checked={formData.roles.includes(role.value)}
                    onCheckedChange={() => handleRoleToggle(role.value)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={role.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {role.label}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any important details about this person..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes}</p>
            )}
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
              This information will be stored securely and only shared according to your instructions.
            </AlertDescription>
          </Alert>
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
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Person
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
