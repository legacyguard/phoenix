import React from 'react';
import LegalLayout from '@/components/layouts/LegalLayout';

const TermsOfService: React.FC = () => {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-lg mb-4">Effective Date: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing or using LegacyGuard Heritage Vault, you agree to be bound by these Terms of Service.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">2. Service Description</h2>
      <p className="mb-4">
        LegacyGuard Heritage Vault provides digital legacy management services, including document storage, 
        will generation, and secure sharing of important information with designated beneficiaries.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">3. User Responsibilities</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account credentials and for all 
        activities that occur under your account.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">4. Privacy and Data Protection</h2>
      <p className="mb-4">
        Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
        use, and protect your information.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">5. Limitation of Liability</h2>
      <p className="mb-4">
        LegacyGuard Heritage Vault shall not be liable for any indirect, incidental, special, consequential, 
        or punitive damages resulting from your use of the service.
      </p>
      
      <p className="mt-8 text-sm text-muted-foreground">
        [This is a placeholder. Please consult with legal counsel to create comprehensive Terms of Service.]
      </p>
    </LegalLayout>
  );
};

export default TermsOfService;
