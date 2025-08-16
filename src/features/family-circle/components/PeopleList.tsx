import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Filter, 
  SortAsc, 
  Search,
  Users,
  UserPlus,
  Heart,
  Briefcase
} from 'lucide-react';
import { Person, PersonRelationship } from '@/types/people';
import { PersonCard } from './PersonCard';
import { usePeople, usePeopleLoading, usePeopleStore } from '@/stores/peopleStore';

interface PeopleListProps {
  onEditPerson: (person: Person) => void;
}

type FilterOption = 'all' | PersonRelationship | 'has-roles' | 'no-roles';
type SortOption = 'name' | 'relationship' | 'recent';

export function PeopleList({ onEditPerson }: PeopleListProps) {
  // Use Zustand store instead of local state
  const people = usePeople();
  const isLoading = usePeopleLoading();
  const { fetchPeople } = usePeopleStore();
  
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  
  // Debounce the search query to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load people
  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Apply filters and sorting when people, search, filter, or sort changes
  useEffect(() => {
    let result = [...people];

    // Apply search filter using debounced value
    if (debouncedSearchQuery) {
      const searchTerm = debouncedSearchQuery.toLowerCase();
      result = result.filter(person => 
        person.fullName.toLowerCase().includes(searchTerm) ||
        person.email?.toLowerCase().includes(searchTerm) ||
        person.phone?.toLowerCase().includes(searchTerm) ||
        person.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'has-roles') {
        result = result.filter(person => person.roles.length > 0);
      } else if (filterBy === 'no-roles') {
        result = result.filter(person => person.roles.length === 0);
      } else {
        result = result.filter(person => person.relationship === filterBy);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'relationship':
          return a.relationship.localeCompare(b.relationship);
        default:
          return 0;
      }
    });

    setFilteredPeople(result);
  }, [people, debouncedSearchQuery, filterBy, sortBy]);

  // Calculate summary statistics
  const familyCount = people.filter(p => ['spouse', 'child', 'parent', 'sibling', 'grandchild'].includes(p.relationship)).length;
  const professionalCount = people.filter(p => p.relationship === 'professional').length;
  const executorCount = people.filter(p => p.roles.includes('executor')).length;
  const guardianCount = people.filter(p => p.roles.includes('guardian')).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        
        {/* Loading skeleton for cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total People</p>
          </div>
          <p className="text-2xl font-bold">{people.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-4 w-4 text-pink-600" />
            <p className="text-sm text-muted-foreground">Family Members</p>
          </div>
          <p className="text-2xl font-bold">{familyCount}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-muted-foreground">Professionals</p>
          </div>
          <p className="text-2xl font-bold">{professionalCount}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">Key Roles</p>
          <div className="flex gap-2">
            <Badge variant="default" className="text-xs">
              {executorCount} Executor{executorCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {guardianCount} Guardian{guardianCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter */}
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All People</SelectItem>
            <SelectItem value="spouse">Spouse</SelectItem>
            <SelectItem value="child">Children</SelectItem>
            <SelectItem value="parent">Parents</SelectItem>
            <SelectItem value="sibling">Siblings</SelectItem>
            <SelectItem value="friend">Friends</SelectItem>
            <SelectItem value="professional">Professionals</SelectItem>
            <SelectItem value="has-roles">✓ Has Roles</SelectItem>
            <SelectItem value="no-roles">⚠️ No Roles</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SortAsc className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="relationship">Relationship</SelectItem>
            <SelectItem value="recent">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* People Grid */}
      {people.length === 0 && !searchQuery && filterBy === 'all' ? (
        <EmptyState
          icon={<UserPlus />}
          title="Your circle is empty"
          description="Start building your trusted circle by adding family members, friends, and professionals who will help manage your legacy."
          className="bg-card rounded-lg border py-16"
        />
      ) : filteredPeople.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="No people found"
          description={searchQuery || filterBy !== 'all' 
            ? 'No people found matching your criteria. Try adjusting your search or filters.' 
            : 'No people added yet. Start by adding your loved ones.'}
          action={
            searchQuery || filterBy !== 'all' ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterBy('all');
                }}
              >
                Clear Filters
              </Button>
            ) : null
          }
          className="bg-card rounded-lg border py-16"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPeople.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={onEditPerson}
            />
          ))}
        </div>
      )}

      {/* Contextual Help */}
      {people.length > 0 && people.filter(p => p.roles.length === 0).length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <span className="font-medium">Tip:</span>{' '}
            {people.filter(p => p.roles.length === 0).length} {people.filter(p => p.roles.length === 0).length === 1 ? 'person doesn\'t' : 'people don\'t'} have any roles assigned yet. 
            Consider assigning roles like Executor, Guardian, or Beneficiary to clarify their responsibilities.
          </p>
        </div>
      )}
    </div>
  );
}
