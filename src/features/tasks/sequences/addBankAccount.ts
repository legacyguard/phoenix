import { TaskSequence } from '@/types/tasks';

/**
 * Task sequence for adding bank account information
 * Following WARP.md principles: empathetic, non-gamified, privacy-first
 */
export const addBankAccountSequence: TaskSequence = {
  id: 'add-bank-account',
  title: 'Secure Bank Account Access',
  category: 'financial',
  icon: 'Landmark',
  totalEstimatedTime: 5, // 5 minutes total
  lifeAreaId: 'financial-security',
  scenario: 'What if something happens to you tomorrow and your family needs access to finances?',
  whyImportant: 'Securing financial information protects your family from stress and uncertainty during difficult times.',
  completionBenefit: 'Your family will have clear information about accessing finances when they need it most.',
  tasks: [
    {
      id: 'bank-name',
      title: 'Bank Name',
      description: 'Let\'s start simple. Enter the name of the bank where you have your main account. For example: "Bank of America" or "Chase Bank".',
      estimatedTime: 1,
      component: 'Input',
      placeholder: 'Your bank name',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
        message: 'Please enter a valid bank name'
      },
      completionMessage: 'Great, you\'ve completed the first step.',
      whyImportant: 'The exact bank name will help your loved ones quickly identify the right institution.'
    },
    {
      id: 'account-number',
      title: 'Account Number / IBAN',
      description: 'Now we need your account number or IBAN. You can find it in your online banking or on your account statement. This data will be securely encrypted.',
      estimatedTime: 2,
      component: 'Input',
      placeholder: 'Enter your account number or IBAN',
      required: true,
      validation: {
        minLength: 15,
        maxLength: 34,
        pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9\\s]+$',
        message: 'Please enter a valid account number or IBAN'
      },
      completionMessage: 'Your banking details are now secure.',
      whyImportant: 'The exact account number is crucial for financial management and inheritance proceedings.'
    },
    {
      id: 'authorized-person',
      title: 'Authorized Person',
      description: 'Does anyone else have access to this account? For example, spouse or other family member? If yes, enter their name and relationship to you.',
      estimatedTime: 1,
      component: 'Textarea',
      placeholder: 'For example: Jane Smith - wife',
      required: false,
      completionMessage: 'Information about authorized persons has been recorded.',
      whyImportant: 'This information will help your family understand who can help with account access.'
    },
    {
      id: 'confirmation',
      title: 'I confirm this information is correct and want to save it securely',
      description: 'All your data will be encrypted and stored only locally on your device. No one except you and your designated persons will have access to it.',
      estimatedTime: 1,
      component: 'Confirmation',
      required: true,
      whyImportant: 'Your privacy is our priority. Data remains under your control.'
    }
  ]
};
