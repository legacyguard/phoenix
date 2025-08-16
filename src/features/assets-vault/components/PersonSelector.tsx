import React, { useState, useEffect, useMemo } from 'react';
import { Person } from '@/types/people';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Users, Shield, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PersonSelectorProps {
  people: Person[];
  selectedPeopleIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  className?: string;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({
  people,
  selectedPeopleIds,
  onSelectionChange,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(
    new Set(selectedPeopleIds)
  );

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedIds(new Set(selectedPeopleIds));
  }, [selectedPeopleIds]);

  // Filter people based on search term
  const filteredPeople = useMemo(() => {
    if (!searchTerm) return people;
    
    const term = searchTerm.toLowerCase();
    return people.filter(person => 
      person.fullName.toLowerCase().includes(term) ||
      person.relationship.toLowerCase().includes(term) ||
      person.roles.some(role => role.toLowerCase().includes(term))
    );
  }, [people, searchTerm]);

  // Group people by relationship for better organization
  const groupedPeople = useMemo(() => {
    const groups: Record<string, Person[]> = {};
    
    filteredPeople.forEach(person => {
      const key = person.relationship;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(person);
    });
    
    return groups;
  }, [filteredPeople]);

  const handleTogglePerson = (personId: string) => {
    const newSelection = new Set(localSelectedIds);
    
    if (newSelection.has(personId)) {
      newSelection.delete(personId);
    } else {
      newSelection.add(personId);
    }
    
    setLocalSelectedIds(newSelection);
    onSelectionChange(Array.from(newSelection));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'executor':
      case 'trustee':
        return <Shield className="h-3 w-3" />;
      case 'beneficiary':
      case 'guardian':
        return <Heart className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    return relationship.charAt(0).toUpperCase() + relationship.slice(1).replace('-', ' ');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by name, relationship, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{localSelectedIds.size} people selected</span>
        </div>
        {localSelectedIds.size > 0 && (
          <button
            type="button"
            onClick={() => {
              setLocalSelectedIds(new Set());
              onSelectionChange([]);
            }}
            className="text-xs hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* People List Grouped by Relationship */}
      <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
        {Object.keys(groupedPeople).length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No people found matching your search.
          </p>
        ) : (
          Object.entries(groupedPeople).map(([relationship, peopleInGroup]) => (
            <div key={relationship} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                {getRelationshipLabel(relationship)}
              </h4>
              <div className="space-y-2">
                {peopleInGroup.map((person) => (
                  <div
                    key={person.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 ease-in-out",
                      localSelectedIds.has(person.id)
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={`person-${person.id}`}
                      checked={localSelectedIds.has(person.id)}
                      onCheckedChange={() => handleTogglePerson(person.id)}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`person-${person.id}`}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{person.fullName}</span>
                        {person.roles.length > 0 && (
                          <div className="flex gap-1">
                            {person.roles.slice(0, 2).map((role) => (
                              <Badge
                                key={role}
                                variant="secondary"
                                className="text-xs px-2 py-0"
                              >
                                <span className="flex items-center gap-1">
                                  {getRoleIcon(role)}
                                  {role.replace('-', ' ')}
                                </span>
                              </Badge>
                            ))}
                            {person.roles.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0"
                              >
                                +{person.roles.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {(person.email || person.phone) && (
                        <div className="text-xs text-muted-foreground">
                          {person.email && <span>{person.email}</span>}
                          {person.email && person.phone && <span> • </span>}
                          {person.phone && <span>{person.phone}</span>}
                        </div>
                      )}
                      {person.notes && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {person.notes}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Select the people who should have access to this asset. Consider including executors, 
        beneficiaries, and trusted family members who may need to manage or access this asset.
      </p>
    </div>
  );
};

export default PersonSelector;
