import React from 'react';

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">{title}</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
