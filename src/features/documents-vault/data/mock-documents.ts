import { Document } from '@/types/documents';

export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    userId: 'user-1',
    name: 'Passport - John Doe',
    category: 'personal',
    status: 'active',
    file: {
      name: 'passport_john_doe.pdf',
      type: 'application/pdf',
      size: 2456789,
      uploadedAt: '2024-01-15T10:00:00Z'
    },
    documentNumber: 'N12345678',
    issuingAuthority: 'United States Department of State',
    issueDate: '2021-06-15',
    expiryDate: '2031-06-14',
    assignedPeople: ['person-1'],
    tags: ['identification', 'travel'],
    notes: 'Primary identification document. Keep in safe.',
    reminderDate: '2031-01-01',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'doc-2',
    userId: 'user-1',
    name: 'Last Will and Testament',
    category: 'legal',
    status: 'active',
    file: {
      name: 'will_2024.pdf',
      type: 'application/pdf',
      size: 1234567,
      uploadedAt: '2024-01-10T10:00:00Z'
    },
    issuingAuthority: 'Mitchell & Associates Law Firm',
    issueDate: '2024-01-05',
    assignedPeople: ['person-1', 'person-5'],
    tags: ['estate-planning', 'critical'],
    notes: 'Updated version. Original with attorney, copy in safe deposit box.',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'doc-3',
    userId: 'user-1',
    name: 'Health Insurance Card - Blue Cross',
    category: 'medical',
    status: 'active',
    file: {
      name: 'insurance_card.jpg',
      type: 'image/jpeg',
      size: 456789,
      uploadedAt: '2024-01-01T10:00:00Z'
    },
    documentNumber: 'BC123456789',
    issuingAuthority: 'Blue Cross Blue Shield',
    issueDate: '2024-01-01',
    expiryDate: '2024-12-31',
    assignedPeople: ['person-1', 'person-6'],
    tags: ['insurance', 'healthcare'],
    notes: 'Primary health insurance. Group plan through employer.',
    reminderDate: '2024-11-01',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'doc-4',
    userId: 'user-1',
    name: 'Property Deed - Family Home',
    category: 'property',
    status: 'active',
    file: {
      name: 'property_deed_oak_street.pdf',
      type: 'application/pdf',
      size: 3456789,
      uploadedAt: '2023-12-15T10:00:00Z'
    },
    documentNumber: 'DEED-2020-4567',
    issuingAuthority: 'Springfield County Recorder',
    issueDate: '2020-03-15',
    assignedPeople: ['person-1'],
    tags: ['real-estate', 'primary-residence'],
    notes: 'Joint ownership with spouse. Original in safe deposit box.',
    createdAt: '2023-12-15T10:00:00Z',
    updatedAt: '2023-12-15T10:00:00Z'
  },
  {
    id: 'doc-5',
    userId: 'user-1',
    name: 'Tax Return 2023',
    category: 'financial',
    status: 'active',
    file: {
      name: 'tax_return_2023.pdf',
      type: 'application/pdf',
      size: 987654,
      uploadedAt: '2024-04-15T10:00:00Z'
    },
    issuingAuthority: 'Internal Revenue Service',
    issueDate: '2024-04-15',
    assignedPeople: ['person-1'],
    tags: ['taxes', 'annual'],
    notes: 'Filed electronically. Keep for 7 years.',
    createdAt: '2024-04-15T10:00:00Z',
    updatedAt: '2024-04-15T10:00:00Z'
  },
  {
    id: 'doc-6',
    userId: 'user-1',
    name: "Driver's License - John Doe",
    category: 'personal',
    status: 'active',
    file: {
      name: 'drivers_license.jpg',
      type: 'image/jpeg',
      size: 234567,
      uploadedAt: '2023-11-01T10:00:00Z'
    },
    documentNumber: 'D123-456-789',
    issuingAuthority: 'Illinois Secretary of State',
    issueDate: '2022-11-01',
    expiryDate: '2026-11-01',
    assignedPeople: ['person-1'],
    tags: ['identification', 'driving'],
    notes: 'REAL ID compliant.',
    reminderDate: '2026-09-01',
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-11-01T10:00:00Z'
  },
  {
    id: 'doc-7',
    userId: 'user-1',
    name: 'Birth Certificate - John Doe',
    category: 'personal',
    status: 'active',
    file: {
      name: 'birth_certificate.pdf',
      type: 'application/pdf',
      size: 567890,
      uploadedAt: '2023-10-01T10:00:00Z'
    },
    documentNumber: 'BC-1970-123456',
    issuingAuthority: 'Illinois Department of Public Health',
    issueDate: '1970-05-15',
    assignedPeople: ['person-1'],
    tags: ['identification', 'vital-record'],
    notes: 'Certified copy obtained in 2023.',
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'doc-8',
    userId: 'user-1',
    name: 'Power of Attorney - Healthcare',
    category: 'legal',
    status: 'active',
    file: {
      name: 'healthcare_poa.pdf',
      type: 'application/pdf',
      size: 789012,
      uploadedAt: '2024-01-05T10:00:00Z'
    },
    issuingAuthority: 'Mitchell & Associates Law Firm',
    issueDate: '2024-01-05',
    assignedPeople: ['person-1', 'person-6'],
    tags: ['healthcare', 'legal', 'critical'],
    notes: 'Sarah designated as healthcare proxy.',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 'doc-9',
    userId: 'user-1',
    name: 'College Diploma - Bachelor of Science',
    category: 'education',
    status: 'active',
    file: {
      name: 'diploma_bs_computer_science.pdf',
      type: 'application/pdf',
      size: 456789,
      uploadedAt: '2023-09-01T10:00:00Z'
    },
    issuingAuthority: 'University of Illinois',
    issueDate: '1992-05-15',
    assignedPeople: [],
    tags: ['education', 'credentials'],
    notes: 'Bachelor of Science in Computer Science.',
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2023-09-01T10:00:00Z'
  },
  {
    id: 'doc-10',
    userId: 'user-1',
    name: 'Vehicle Title - 2022 Tesla Model 3',
    category: 'property',
    status: 'active',
    file: {
      name: 'tesla_title.pdf',
      type: 'application/pdf',
      size: 345678,
      uploadedAt: '2023-08-01T10:00:00Z'
    },
    documentNumber: 'VT-2022-789012',
    issuingAuthority: 'Illinois Secretary of State',
    issueDate: '2022-06-15',
    assignedPeople: ['person-1'],
    tags: ['vehicle', 'title'],
    notes: 'VIN: 5YJ3E1EA6NF123456. No liens.',
    createdAt: '2023-08-01T10:00:00Z',
    updatedAt: '2023-08-01T10:00:00Z'
  },
  {
    id: 'doc-11',
    userId: 'user-1',
    name: 'Life Insurance Policy - MetLife',
    category: 'financial',
    status: 'active',
    file: {
      name: 'life_insurance_policy.pdf',
      type: 'application/pdf',
      size: 678901,
      uploadedAt: '2023-07-01T10:00:00Z'
    },
    documentNumber: 'LI-2020-123456',
    issuingAuthority: 'MetLife Insurance Company',
    issueDate: '2020-01-01',
    expiryDate: '2050-01-01',
    assignedPeople: ['person-1'],
    tags: ['insurance', 'life', 'critical'],
    notes: '$500,000 term life policy. Sarah is primary beneficiary.',
    reminderDate: '2025-01-01',
    createdAt: '2023-07-01T10:00:00Z',
    updatedAt: '2023-07-01T10:00:00Z'
  },
  {
    id: 'doc-12',
    userId: 'user-1',
    name: 'Social Security Card',
    category: 'personal',
    status: 'active',
    file: {
      name: 'ss_card.jpg',
      type: 'image/jpeg',
      size: 123456,
      uploadedAt: '2023-06-01T10:00:00Z'
    },
    documentNumber: '***-**-4567',
    issuingAuthority: 'Social Security Administration',
    issueDate: '1970-06-01',
    assignedPeople: ['person-1'],
    tags: ['identification', 'federal', 'sensitive'],
    notes: 'Keep in secure location. Never share full number online.',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-01T10:00:00Z'
  }
];
