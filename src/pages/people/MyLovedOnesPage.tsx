import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Person } from '@/types/people';
import { PeopleList } from '@/features/family-circle/components/PeopleList';
import { AddPersonDialog } from '@/features/family-circle/components/AddPersonDialog';
import { EditPersonDialog } from '@/features/family-circle/components/EditPersonDialog';
import { usePeopleStore } from '@/stores/peopleStore';

export function MyLovedOnesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPersonForEdit, setSelectedPersonForEdit] = useState<Person | null>(null);
  const { fetchPeople } = usePeopleStore();

  const handleAddPerson = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setSelectedPersonForEdit(person);
    setIsEditDialogOpen(true);
  };

  const handlePersonAdded = () => {
    fetchPeople(); // Refresh people from store
    setIsAddDialogOpen(false);
  };

  const handlePersonUpdated = () => {
    fetchPeople(); // Refresh people from store
    setIsEditDialogOpen(false);
    setSelectedPersonForEdit(null);
  };

  const handlePersonDeleted = () => {
    fetchPeople(); // Refresh people from store
    setIsEditDialogOpen(false);
    setSelectedPersonForEdit(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Your Trusted Circle
            </h1>
            <p className="text-muted-foreground">
              Manage the people who are most important to your legacy and who you trust to help.
            </p>
          </div>
          <Button 
            onClick={handleAddPerson} 
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <Plus className="h-5 w-5" />
            Add Person
          </Button>
        </div>

        {/* Welcome Alert */}
        <Alert className="border-primary/20 bg-primary/5">
          <Heart className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>This is your inner circle.</strong> These are the people who will be contacted in an emergency, who may execute your will, or who will inherit your legacy. 
            Start by adding your spouse, children, and closest friends.
          </AlertDescription>
        </Alert>
      </div>

      {/* People List */}
      <div className="space-y-6">
        <PeopleList 
          onEditPerson={handleEditPerson}
        />
      </div>

      {/* Dialogs */}
      <AddPersonDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onPersonAdded={handlePersonAdded}
      />

      <EditPersonDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedPersonForEdit(null);
        }}
        person={selectedPersonForEdit}
        onPersonUpdated={handlePersonUpdated}
        onPersonDeleted={handlePersonDeleted}
      />
    </div>
  );
}
