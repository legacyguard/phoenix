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
import { Checkbox } from '@/components/ui/checkbox';
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
  Heart,
  Users,
  Briefcase,
  UserCheck,
  Info,
  Loader2,
  Calendar,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Person, PersonFormData, PersonRelationship, PersonRole } from '@/types/people';
import { updatePerson, deletePerson } from '@/services/peopleService';
import { toast } from 'sonner';

interface EditPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onPersonUpdated: () => void;
  onPersonDeleted: () => void;
}

export function EditPersonDialog({ 
  isOpen, 
  onClose, 
  person, 
  onPersonUpdated,
  onPersonDeleted 
}: EditPersonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState<PersonFormData>({
    fullName: '',
    relationship: 'friend',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    roles: [],
    notes: ''
  });

  // Load person data when dialog opens or person changes
  useEffect(() => {
    if (person) {
      setFormData({
        fullName: person.fullName,
        relationship: person.relationship,
        email: person.email || '',
        phone: person.phone || '',
        address: person.address || '',
        dateOfBirth: person.dateOfBirth ? person.dateOfBirth.split('T')[0] : '',
        roles: person.roles || [],
        notes: person.notes || ''
      });
    }
  }, [person]);

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
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async () => {
    if (!person) return;

    if (!formData.fullName.trim()) {
      toast.error('Please provide a name');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePerson(person.id, formData);
      toast.success('Person updated successfully');
      onPersonUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating person:', error);
      toast.error('Failed to update person. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!person) return;

    setIsDeleting(true);
    try {
      await deletePerson(person.id);
      toast.success('Person deleted successfully');
      onPersonDeleted();
      handleClose();
    } catch (error) {
      console.error('Error deleting person:', error);
      toast.error('Failed to delete person. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      relationship: 'friend',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      roles: [],
      notes: ''
    });
    setShowDeleteDialog(false);
    onClose();
  };

  if (!person) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Person</SheetTitle>
            <SheetDescription>
              Update the details for {person.fullName}. Keep their information current.
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
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select 
                  value={formData.relationship} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value as PersonRelationship }))}
                >
                  <SelectTrigger id="relationship">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street, City, State"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
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
                      id={`edit-${role.value}`}
                      checked={formData.roles.includes(role.value)}
                      onCheckedChange={() => handleRoleToggle(role.value)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`edit-${role.value}`}
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
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Person
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
              disabled={isSubmitting || !formData.fullName.trim()}
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
                Delete Person
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{person.fullName}"? This action cannot be undone.
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
