import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePeopleStore, usePeople } from '../peopleStore';
import { peopleService } from '@/services/peopleService';
import { Person, PersonFormData, PersonRole, PersonRelationship } from '@/types/people';

// Mock peopleService
vi.mock('@/services/peopleService', () => ({
  peopleService: {
    getPeople: vi.fn(),
    createPerson: vi.fn(),
    updatePerson: vi.fn(),
    deletePerson: vi.fn(),
  },
}));

const mockPeople: Person[] = [
  {
    id: 'person-1',
    userId: 'user-1',
    fullName: 'Sarah Johnson',
    relationship: 'spouse',
    email: 'sarah@example.com',
    phone: '+1-555-0123',
    address: '123 Oak Street, Springfield',
    dateOfBirth: '1985-03-15',
    roles: ['executor', 'beneficiary'],
    notes: 'Primary contact and executor',
    hasAccessToAssets: ['asset-1', 'asset-2'],
    documentsShared: ['doc-1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'person-2',
    userId: 'user-1',
    fullName: 'Michael Johnson',
    relationship: 'child',
    email: 'michael@example.com',
    phone: '+1-555-0124',
    address: '123 Oak Street, Springfield',
    dateOfBirth: '2010-07-22',
    roles: ['beneficiary'],
    notes: 'Minor child, needs guardian',
    hasAccessToAssets: [],
    documentsShared: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('People Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      usePeopleStore.setState({
        people: [],
        isLoading: false,
        error: null,
        selectedPerson: null,
      });
    });
    
    vi.clearAllMocks();
  });

  describe('usePeopleStore', () => {
    it('should have initial state', () => {
      const { result } = renderHook(() => usePeopleStore());
      
      expect(result.current.people).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedPerson).toBeNull();
    });

    it('should fetch people successfully', async () => {
      const mockGetPeople = vi.mocked(peopleService.getPeople);
      mockGetPeople.mockResolvedValue(mockPeople);

      const { result } = renderHook(() => usePeopleStore());

      await act(async () => {
        await result.current.fetchPeople();
      });

      expect(result.current.people).toEqual(mockPeople);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetPeople).toHaveBeenCalledOnce();
    });

    it('should handle fetch people error', async () => {
      const mockGetPeople = vi.mocked(peopleService.getPeople);
      mockGetPeople.mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(() => usePeopleStore());

      await act(async () => {
        await result.current.fetchPeople();
      });

      expect(result.current.people).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Fetch failed');
    });

    it('should add person successfully', async () => {
      const newPersonData: PersonFormData = {
        fullName: 'New Person',
        relationship: 'friend',
        email: 'new@example.com',
        roles: ['emergency-contact'],
      };

      const createdPerson: Person = {
        ...newPersonData,
        id: 'person-new',
        userId: 'user-1',
        hasAccessToAssets: [],
        documentsShared: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockCreatePerson = vi.mocked(peopleService.createPerson);
      mockCreatePerson.mockResolvedValue(createdPerson);

      const { result } = renderHook(() => usePeopleStore());

      await act(async () => {
        await result.current.addPerson(newPersonData);
      });

      expect(result.current.people).toContain(createdPerson);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockCreatePerson).toHaveBeenCalledWith(newPersonData);
    });

    it('should update person successfully', async () => {
      // First, set up some people
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const updates = { fullName: 'Updated Name' };
      const updatedPerson = { ...mockPeople[0], ...updates, updatedAt: '2024-01-02T00:00:00Z' };

      const mockUpdatePerson = vi.mocked(peopleService.updatePerson);
      mockUpdatePerson.mockResolvedValue(updatedPerson);

      const { result } = renderHook(() => usePeopleStore());

      await act(async () => {
        await result.current.updatePerson('person-1', updates);
      });

      expect(result.current.people[0].fullName).toBe('Updated Name');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockUpdatePerson).toHaveBeenCalledWith('person-1', updates);
    });

    it('should delete person successfully', async () => {
      // First, set up some people
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const mockDeletePerson = vi.mocked(peopleService.deletePerson);
      mockDeletePerson.mockResolvedValue(true);

      const { result } = renderHook(() => usePeopleStore());

      await act(async () => {
        await result.current.deletePerson('person-1');
      });

      expect(result.current.people).toHaveLength(1);
      expect(result.current.people[0].id).toBe('person-2');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockDeletePerson).toHaveBeenCalledWith('person-1');
    });

    it('should select person', () => {
      const { result } = renderHook(() => usePeopleStore());

      act(() => {
        result.current.selectPerson(mockPeople[0]);
      });

      expect(result.current.selectedPerson).toEqual(mockPeople[0]);
    });

    it('should clear error', () => {
      // First, set an error
      act(() => {
        usePeopleStore.setState({ error: 'Test error' });
      });

      const { result } = renderHook(() => usePeopleStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should get person by ID', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeopleStore());

      const person = result.current.getPersonById('person-1');
      expect(person).toEqual(mockPeople[0]);

      const nonExistentPerson = result.current.getPersonById('non-existent');
      expect(nonExistentPerson).toBeNull();
    });

    it('should get people by role', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeopleStore());

      const executors = result.current.getPeopleByRole('executor');
      expect(executors).toHaveLength(1);
      expect(executors[0].roles).toContain('executor');

      const beneficiaries = result.current.getPeopleByRole('beneficiary');
      expect(beneficiaries).toHaveLength(2);
    });

    it('should get people by relationship', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeopleStore());

      const spouses = result.current.getPeopleByRelationship('spouse');
      expect(spouses).toHaveLength(1);
      expect(spouses[0].relationship).toBe('spouse');

      const children = result.current.getPeopleByRelationship('child');
      expect(children).toHaveLength(1);
      expect(children[0].relationship).toBe('child');
    });

    it('should search people', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeopleStore());

      const searchResults = result.current.searchPeople('Sarah');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].fullName).toBe('Sarah Johnson');

      const emailResults = result.current.searchPeople('@example.com');
      expect(emailResults).toHaveLength(2);
    });

    it('should get people with access to asset', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeopleStore());

      const peopleWithAsset1 = result.current.getPeopleWithAccessToAsset('asset-1');
      expect(peopleWithAsset1).toHaveLength(1);
      expect(peopleWithAsset1[0].id).toBe('person-1');

      const peopleWithAsset3 = result.current.getPeopleWithAccessToAsset('asset-3');
      expect(peopleWithAsset3).toHaveLength(0);
    });

    it('should get people with shared documents', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeopleStore());

      const peopleWithDoc1 = result.current.getPeopleWithSharedDocuments('doc-1');
      expect(peopleWithDoc1).toHaveLength(1);
      expect(peopleWithDoc1[0].id).toBe('person-1');

      const peopleWithDoc2 = result.current.getPeopleWithSharedDocuments('doc-2');
      expect(peopleWithDoc2).toHaveLength(0);
    });
  });

  describe('Selectors', () => {
    it('should usePeople selector work correctly', () => {
      act(() => {
        usePeopleStore.setState({ people: mockPeople });
      });

      const { result } = renderHook(() => usePeople());
      expect(result.current).toEqual(mockPeople);
    });
  });
});
