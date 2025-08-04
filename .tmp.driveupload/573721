import { describe, it, expect } from 'vitest';
import type {
  WillRequirements,
  GeneratedWill,
  WillContent,
  Beneficiary,
  AssetAllocation,
  Executor,
  Guardian,
  SpecialBequest,
  WillSignature,
  WillGenerationStep
} from '../will';

describe('Will Types', () => {
  describe('WillRequirements', () => {
    it('should have correct structure for will requirements', () => {
      const requirements: WillRequirements = {
        id: 1,
        country_code: 'SK',
        country_name: 'Slovakia',
        witness_count: 2,
        requires_handwriting: true,
        requires_notarization: false,
        required_clauses: ['identity', 'revocation', 'distribution'],
        forbidden_content: [],
        legal_language: {
          title: 'Last Will and Testament',
          identity: 'I, [name], born on [date]',
          revocation: 'I hereby revoke all previous wills',
          beneficiaries: 'I bequeath to',
          signature: 'Signature',
          witness: 'Witness',
          date: 'Date',
          soundMind: 'being of sound mind'
        },
        signature_requirements: 'Must be signed in presence of witnesses'
      };

      expect(requirements.country_code).toBe('SK');
      expect(requirements.witness_count).toBe(2);
      expect(requirements.legal_language.title).toBe('Last Will and Testament');
    });
  });

  describe('WillContent', () => {
    it('should have complete will content structure', () => {
      const willContent: WillContent = {
        testator: {
          name: 'John Doe',
          birthDate: '1970-01-01',
          address: '123 Main St',
          identification: '1234567890'
        },
        beneficiaries: [
          {
            id: 'ben-1',
            name: 'Jane Doe',
            relationship: 'spouse',
            allocation: [
              {
                assetType: 'percentage',
                description: '50% of all assets',
                value: 50
              }
            ]
          }
        ],
        executor: {
          name: 'Robert Smith',
          relationship: 'friend',
          address: '456 Oak St',
          phone: '+1234567890'
        },
        guardians: [
          {
            name: 'Mary Johnson',
            relationship: 'sister',
            address: '789 Elm St',
            forChildren: ['Child 1', 'Child 2']
          }
        ],
        specialBequests: [
          {
            item: 'Family heirloom watch',
            beneficiary: 'Son John Jr.',
            condition: 'Upon reaching age 21'
          }
        ],
        finalWishes: 'Simple funeral service',
        createdDate: '2024-01-01'
      };

      expect(willContent.testator.name).toBe('John Doe');
      expect(willContent.beneficiaries).toHaveLength(1);
      expect(willContent.beneficiaries[0].allocation[0].value).toBe(50);
      expect(willContent.guardians?.[0].forChildren).toHaveLength(2);
    });
  });

  describe('AssetAllocation', () => {
    it('should support percentage allocation', () => {
      const allocation: AssetAllocation = {
        assetType: 'percentage',
        description: '25% of estate',
        value: 25
      };

      expect(allocation.assetType).toBe('percentage');
      expect(allocation.value).toBe(25);
    });

    it('should support specific asset allocation', () => {
      const allocation: AssetAllocation = {
        assetType: 'specific',
        description: 'Family properties',
        specificAssets: ['House at 123 Main St', 'Vacation home']
      };

      expect(allocation.assetType).toBe('specific');
      expect(allocation.specificAssets).toHaveLength(2);
    });
  });

  describe('GeneratedWill', () => {
    it('should have correct status values', () => {
      const will: GeneratedWill = {
        id: 'will-123',
        user_id: 'user-456',
        country_code: 'US',
        will_content: {
          testator: {
            name: 'Test User',
            birthDate: '1980-01-01',
            address: 'Test Address'
          },
          beneficiaries: [],
          createdDate: '2024-01-01'
        },
        status: 'draft',
        version: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const validStatuses: GeneratedWill['status'][] = ['draft', 'pending_signatures', 'completed', 'revoked'];
      expect(validStatuses).toContain(will.status);
    });
  });

  describe('WillSignature', () => {
    it('should support different signatory types', () => {
      const signatures: WillSignature[] = [
        {
          id: 'sig-1',
          will_id: 'will-123',
          signatory_type: 'testator',
          signatory_name: 'John Doe',
          signed_at: '2024-01-01T10:00:00Z',
          signature_data: 'base64-signature-data'
        },
        {
          id: 'sig-2',
          will_id: 'will-123',
          signatory_type: 'witness',
          signatory_name: 'Witness 1',
          signed_at: '2024-01-01T10:01:00Z'
        },
        {
          id: 'sig-3',
          will_id: 'will-123',
          signatory_type: 'notary',
          signatory_name: 'Notary Public',
          signed_at: '2024-01-01T10:02:00Z'
        }
      ];

      const signatoryTypes = signatures.map(s => s.signatory_type);
      expect(signatoryTypes).toContain('testator');
      expect(signatoryTypes).toContain('witness');
      expect(signatoryTypes).toContain('notary');
    });
  });

  describe('Executor with alternative', () => {
    it('should support alternative executor', () => {
      const executor: Executor = {
        name: 'Primary Executor',
        relationship: 'brother',
        address: '123 Main St',
        phone: '+1234567890',
        alternativeExecutor: {
          name: 'Alternative Executor',
          relationship: 'friend',
          address: '456 Oak St',
          phone: '+0987654321'
        }
      };

      expect(executor.alternativeExecutor).toBeDefined();
      expect(executor.alternativeExecutor?.name).toBe('Alternative Executor');
    });
  });
});
