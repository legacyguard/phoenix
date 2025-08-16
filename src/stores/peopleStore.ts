/**
 * People Store - Zustand store for managing people state
 * Centralizes all people-related state management
 */

import { create } from 'zustand';
import { peopleService } from '@/services/peopleService';
import { Person, PersonFormData, PersonRole, PersonRelationship } from '@/types/people';

interface PeopleStoreState {
  // State
  people: Person[];
  isLoading: boolean;
  error: string | null;
  selectedPerson: Person | null;
  
  // Actions
  fetchPeople: () => Promise<void>;
  addPerson: (newPerson: PersonFormData) => Promise<void>;
  updatePerson: (id: string, updates: Partial<Person>) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;
  selectPerson: (person: Person | null) => void;
  clearError: () => void;
  
  // Computed values
  getPersonById: (id: string) => Person | null;
  getPeopleByRole: (role: PersonRole) => Person[];
  getPeopleByRelationship: (relationship: PersonRelationship) => Person[];
  searchPeople: (query: string) => Person[];
  getPeopleWithAccessToAsset: (assetId: string) => Person[];
  getPeopleWithSharedDocuments: (documentId: string) => Person[];
}

export const usePeopleStore = create<PeopleStoreState>((set, get) => ({
  // Initial state
  people: [],
  isLoading: false,
  error: null,
  selectedPerson: null,

  // Actions
  fetchPeople: async () => {
    try {
      set({ isLoading: true, error: null });
      const people = await peopleService.getPeople();
      set({ people, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch people',
        isLoading: false 
      });
    }
  },

  addPerson: async (newPersonData: PersonFormData) => {
    try {
      set({ isLoading: true, error: null });
      const createdPerson = await peopleService.createPerson(newPersonData);
      set((state) => ({ 
        people: [...state.people, createdPerson],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add person',
        isLoading: false 
      });
    }
  },

  updatePerson: async (id: string, updates: Partial<Person>) => {
    try {
      set({ isLoading: true, error: null });
      const updatedPerson = await peopleService.updatePerson(id, updates);
      
      if (updatedPerson) {
        set((state) => ({
          people: state.people.map((person) =>
            person.id === id ? updatedPerson : person
          ),
          selectedPerson: state.selectedPerson?.id === id ? updatedPerson : state.selectedPerson,
          isLoading: false
        }));
      } else {
        set({ 
          error: 'Person not found',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update person',
        isLoading: false 
      });
    }
  },

  deletePerson: async (personId: string) => {
    try {
      set({ isLoading: true, error: null });
      const success = await peopleService.deletePerson(personId);
      
      if (success) {
        set((state) => ({
          people: state.people.filter((person) => person.id !== personId),
          selectedPerson: state.selectedPerson?.id === personId ? null : state.selectedPerson,
          isLoading: false
        }));
      } else {
        set({ 
          error: 'Person not found',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete person',
        isLoading: false 
      });
    }
  },

  selectPerson: (person: Person | null) => {
    set({ selectedPerson: person });
  },

  clearError: () => {
    set({ error: null });
  },

  // Computed values (getters)
  getPersonById: (id: string) => {
    const { people } = get();
    return people.find(person => person.id === id) || null;
  },

  getPeopleByRole: (role: PersonRole) => {
    const { people } = get();
    return people.filter(person => person.roles.includes(role));
  },

  getPeopleByRelationship: (relationship: PersonRelationship) => {
    const { people } = get();
    return people.filter(person => person.relationship === relationship);
  },

  searchPeople: (query: string) => {
    const { people } = get();
    const lowerQuery = query.toLowerCase();
    
    return people.filter(person => 
      person.fullName.toLowerCase().includes(lowerQuery) ||
      person.email?.toLowerCase().includes(lowerQuery) ||
      person.phone?.toLowerCase().includes(lowerQuery) ||
      person.notes?.toLowerCase().includes(lowerQuery)
    );
  },

  getPeopleWithAccessToAsset: (assetId: string) => {
    const { people } = get();
    return people.filter(person => 
      person.hasAccessToAssets?.includes(assetId)
    );
  },

  getPeopleWithSharedDocuments: (documentId: string) => {
    const { people } = get();
    return people.filter(person => 
      person.documentsShared?.includes(documentId)
    );
  },
}));

// Export selectors for better performance
export const usePeople = () => usePeopleStore((state) => state.people);
export const usePeopleLoading = () => usePeopleStore((state) => state.isLoading);
export const usePeopleError = () => usePeopleStore((state) => state.error);
export const useSelectedPerson = () => usePeopleStore((state) => state.selectedPerson);
