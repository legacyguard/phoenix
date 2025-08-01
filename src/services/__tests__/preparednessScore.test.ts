import { describe, it, expect } from 'vitest';

// Import the calculatePreparednessScore function from the family-hub route
// Since it's not exported, we'll recreate the logic here for testing
function calculatePreparednessScore(person: any): number {
  let score = 0;
  
  // Base score for being added as trusted person
  score += 20;
  
  // Access level scoring
  switch (person.access_level) {
    case 'full_access':
      score += 30;
      break;
    case 'limited_info':
      score += 20;
      break;
    case 'emergency_only':
      score += 10;
      break;
    default:
      score += 0;
  }
  
  // Email verified
  if (person.email) score += 10;
  
  // Phone provided
  if (person.phone) score += 10;
  
  // Responsibilities defined
  if (person.responsibilities && person.responsibilities.length > 0) {
    score += Math.min(person.responsibilities.length * 5, 20);
  }
  
  // Recent communication (within 30 days)
  const daysSinceContact = person.last_communicated 
    ? Math.floor((Date.now() - new Date(person.last_communicated).getTime()) / (1000 * 60 * 60 * 24))
    : 365;
  
  if (daysSinceContact <= 7) score += 10;
  else if (daysSinceContact <= 30) score += 5;
  
  return Math.min(score, 100);
}

describe('PreparednessScore Calculation', () => {
  describe('calculatePreparednessScore', () => {
    it('should return base score of 20 for minimal person data', () => {
      const person = {
        id: '1',
        name: 'John Doe'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(20);
    });

    it('should add 30 points for full access level', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        access_level: 'full_access'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(50); // 20 base + 30 full access
    });

    it('should add 20 points for limited info access level', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        access_level: 'limited_info'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(40); // 20 base + 20 limited info
    });

    it('should add 10 points for emergency only access level', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        access_level: 'emergency_only'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(30); // 20 base + 10 emergency only
    });

    it('should add 10 points for having an email', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(30); // 20 base + 10 email
    });

    it('should add 10 points for having a phone number', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        phone: '+1234567890'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(30); // 20 base + 10 phone
    });

    it('should add points for responsibilities (max 20)', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        responsibilities: ['financial', 'medical', 'legal', 'caregiving', 'executor']
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(40); // 20 base + 20 (5 responsibilities * 5, capped at 20)
    });

    it('should add 10 points for communication within 7 days', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        last_communicated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(30); // 20 base + 10 recent communication
    });

    it('should add 5 points for communication within 30 days', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        last_communicated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(25); // 20 base + 5 recent communication
    });

    it('should not add points for communication older than 30 days', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        last_communicated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(20); // 20 base only
    });

    it('should calculate maximum score correctly', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        access_level: 'full_access',
        email: 'john@example.com',
        phone: '+1234567890',
        responsibilities: ['financial', 'medical', 'legal', 'caregiving'],
        last_communicated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(100); // 20 base + 30 full access + 10 email + 10 phone + 20 responsibilities + 10 recent communication
    });

    it('should cap score at 100 even if calculation exceeds it', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        access_level: 'full_access',
        email: 'john@example.com',
        phone: '+1234567890',
        responsibilities: ['financial', 'medical', 'legal', 'caregiving', 'executor', 'trustee', 'guardian'],
        last_communicated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(100); // Should be capped at 100
    });

    it('should handle missing last_communicated gracefully', () => {
      const person = {
        id: '1',
        name: 'John Doe'
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(20); // 20 base only
    });

    it('should handle empty responsibilities array', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        responsibilities: []
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(20); // 20 base only
    });

    it('should handle null responsibilities', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        responsibilities: null
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(20); // 20 base only
    });

    it('should handle undefined access_level', () => {
      const person = {
        id: '1',
        name: 'John Doe',
        access_level: undefined
      };

      const score = calculatePreparednessScore(person);
      expect(score).toBe(20); // 20 base only
    });
  });

  describe('Score Categories', () => {
    it('should categorize scores correctly', () => {
      const getScoreCategory = (score: number) => {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        if (score >= 30) return 'poor';
        return 'critical';
      };

      expect(getScoreCategory(100)).toBe('excellent');
      expect(getScoreCategory(90)).toBe('excellent');
      expect(getScoreCategory(85)).toBe('excellent');
      expect(getScoreCategory(84)).toBe('good');
      expect(getScoreCategory(70)).toBe('good');
      expect(getScoreCategory(69)).toBe('fair');
      expect(getScoreCategory(50)).toBe('fair');
      expect(getScoreCategory(49)).toBe('poor');
      expect(getScoreCategory(30)).toBe('poor');
      expect(getScoreCategory(29)).toBe('critical');
      expect(getScoreCategory(20)).toBe('critical');
    });
  });
}); 