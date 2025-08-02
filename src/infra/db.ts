// Database abstraction layer - Stub implementation for tests
export interface Account {
  id: string;
  needsReview: boolean;
}

export interface LifeEvent {
  userId: string;
  type: string;
  timestamp: Date;
}

export interface Checklist {
  id: string;
  userId: string;
  items: string[];
}

// Mock database interface
export const db = {
  accounts: {
    where: (field: string, value: any): Account[] => {
      // Stub implementation
      return [];
    },
  },
  lifeEvents: {
    insert: (event: Partial<LifeEvent>): Promise<void> => {
      // Stub implementation
      return Promise.resolve();
    },
  },
  checklists: {
    insert: (checklist: Partial<Checklist>): Promise<void> => {
      // Stub implementation
      return Promise.resolve();
    },
  },
};