/**
 * People Service - manages loved ones data with centralized storage
 * Following WARP.md privacy-first principles
 */

import { Person, PersonFormData } from '@/types/people';
import { mockPeople } from '@/features/family-circle/data/mock-people';
import { storageService } from './storageService';
import { storageKeys } from '@/config/storageKeys';

// Initialize storage with mock data if empty
const initializeStorage = () => {
  const existing = storageService.get<Person[]>(storageKeys.people);
  if (!existing) {
    storageService.set(storageKeys.people, mockPeople);
  }
};

// Get all people for the current user
export const getPeople = async (): Promise<Person[]> => {
  initializeStorage();
  
  try {
    const people = storageService.get<Person[]>(storageKeys.people) || [];
    
    // In a real app, filter by current user ID
    return people;
  } catch (error) {
    console.error('Error loading people:', error);
    return [];
  }
};

// Get a single person by ID
export const getPersonById = async (id: string): Promise<Person | null> => {
  const people = await getPeople();
  return people.find(person => person.id === id) || null;
};

// Create a new person
export const createPerson = async (formData: PersonFormData): Promise<Person> => {
  const people = await getPeople();
  
  const newPerson: Person = {
    ...formData,
    id: `person-${Date.now()}`,
    userId: 'user-1', // In real app, get from auth
    hasAccessToAssets: [],
    documentsShared: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedPeople = [...people, newPerson];
  storageService.set(storageKeys.people, updatedPeople);
  
  return newPerson;
};

// Update an existing person
export const updatePerson = async (
  id: string, 
  updates: Partial<Person>
): Promise<Person | null> => {
  const people = await getPeople();
  const index = people.findIndex(person => person.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedPerson: Person = {
    ...people[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  people[index] = updatedPerson;
  storageService.set(storageKeys.people, people);
  
  return updatedPerson;
};

// Delete a person
export const deletePerson = async (id: string): Promise<boolean> => {
  const people = await getPeople();
  const filteredPeople = people.filter(person => person.id !== id);
  
  if (filteredPeople.length === people.length) {
    return false; // Person not found
  }
  
  storageService.set(storageKeys.people, filteredPeople);
  return true;
};

// Get people by role
export const getPeopleByRole = async (role: string): Promise<Person[]> => {
  const people = await getPeople();
  return people.filter(person => person.roles.includes(role as any));
};

// Get people by relationship
export const getPeopleByRelationship = async (relationship: string): Promise<Person[]> => {
  const people = await getPeople();
  return people.filter(person => person.relationship === relationship);
};

// Search people
export const searchPeople = async (query: string): Promise<Person[]> => {
  const people = await getPeople();
  const lowerQuery = query.toLowerCase();
  
  return people.filter(person => 
    person.fullName.toLowerCase().includes(lowerQuery) ||
    person.email?.toLowerCase().includes(lowerQuery) ||
    person.phone?.toLowerCase().includes(lowerQuery) ||
    person.notes?.toLowerCase().includes(lowerQuery)
  );
};
