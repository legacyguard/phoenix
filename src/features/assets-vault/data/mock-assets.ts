import { Asset } from '@/types/assets';

export const mockAssets: Asset[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Primary Checking Account',
    category: 'financial',
    institution: 'Chase Bank',
    accountNumber: '****4567',
    accountType: 'checking',
    estimatedValue: 15000,
    accessInfo: ['Sarah (Spouse)', 'Michael (Son)'],
    assignedPeople: ['person-1', 'person-2'], // Sarah and Michael
    notes: 'Main account for daily expenses and bills',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    status: 'secured'
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Family Home',
    category: 'real-estate',
    address: '123 Oak Street, Springfield, IL 62701',
    propertyType: 'single-family',
    estimatedValue: 450000,
    accessInfo: ['Sarah (Spouse)'],
    assignedPeople: ['person-1'], // Sarah
    notes: 'Primary residence, mortgage with Wells Fargo',
    createdAt: '2020-03-15T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    status: 'secured'
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Investment Portfolio',
    category: 'financial',
    institution: 'Vanguard',
    accountNumber: '****8901',
    accountType: 'investment',
    estimatedValue: 125000,
    accessInfo: ['Sarah (Spouse)', 'Financial Advisor'],
    assignedPeople: ['person-1'], // Sarah (Financial Advisor not in people list)
    notes: 'Long-term retirement investments',
    createdAt: '2018-01-01T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    status: 'secured'
  },
  {
    id: '4',
    userId: 'user-1',
    name: '2022 Tesla Model 3',
    category: 'vehicles',
    location: 'Home garage',
    estimatedValue: 42000,
    accessInfo: ['Sarah (Spouse)'],
    assignedPeople: ['person-1'], // Sarah
    notes: 'VIN: 5YJ3E1EA6NF123456',
    createdAt: '2022-06-15T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    status: 'secured'
  },
  {
    id: '5',
    userId: 'user-1',
    name: 'Grandmother\'s Diamond Ring',
    category: 'valuables',
    location: 'Safe deposit box at Chase Bank',
    estimatedValue: 8000,
    accessInfo: ['Sarah (Spouse)', 'Emily (Daughter)'],
    assignedPeople: ['person-1', 'person-3'], // Sarah and Emily
    notes: 'Family heirloom, to be passed to Emily',
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z',
    status: 'secured'
  },
  {
    id: '6',
    userId: 'user-1',
    name: 'Tech Consulting LLC',
    category: 'business',
    location: 'Delaware registration',
    estimatedValue: 75000,
    accessInfo: ['Sarah (Spouse)', 'Business Partner - John'],
    assignedPeople: ['person-1', 'person-9'], // Sarah and John Davidson
    notes: 'Operating agreement in filing cabinet',
    createdAt: '2019-05-01T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    status: 'secured'
  },
  {
    id: '7',
    userId: 'user-1',
    name: 'Cryptocurrency Wallet',
    category: 'digital',
    location: 'Hardware wallet in home safe',
    estimatedValue: 35000,
    accessInfo: ['Tech-savvy nephew - Alex'],
    assignedPeople: ['person-7'], // Alex Chen
    notes: 'Recovery phrase in safety deposit box',
    createdAt: '2021-01-01T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
    status: 'needs-attention'
  },
  {
    id: '8',
    userId: 'user-1',
    name: 'Life Insurance Policy',
    category: 'other',
    location: 'Documents folder in filing cabinet',
    estimatedValue: 500000,
    accessInfo: ['Sarah (Spouse)'],
    assignedPeople: ['person-1'], // Sarah
    notes: 'Policy #LI-2020-123456 with MetLife',
    createdAt: '2020-01-01T10:00:00Z',
    updatedAt: '2023-11-15T10:00:00Z',
    status: 'secured'
  },
  {
    id: '9',
    userId: 'user-1',
    name: 'Emergency Savings',
    category: 'financial',
    institution: 'Ally Bank',
    accountNumber: '****2345',
    accountType: 'savings',
    estimatedValue: 25000,
    accessInfo: ['Sarah (Spouse)'],
    assignedPeople: ['person-1'], // Sarah
    notes: '6 months of expenses',
    createdAt: '2021-06-01T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    status: 'secured'
  },
  {
    id: '10',
    userId: 'user-1',
    name: 'Art Collection',
    category: 'valuables',
    location: 'Various locations in home',
    estimatedValue: 15000,
    accessInfo: ['Sarah (Spouse)', 'Art Appraiser - Lisa'],
    assignedPeople: ['person-1', 'person-10'], // Sarah and Lisa Martinez
    notes: 'Appraisal documents in filing cabinet',
    createdAt: '2015-01-01T10:00:00Z',
    updatedAt: '2023-10-01T10:00:00Z',
    status: 'needs-attention'
  }
];
