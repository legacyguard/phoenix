import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-6 text-sm">
          <Link 
            to="/pricing" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link 
            to="/terms-of-service" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
          <Link 
            to="/privacy-policy" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/refund-policy" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Refund Policy
          </Link>
          <a 
            href="mailto:support@legacyguard.com" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Support
          </a>
        </nav>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LegacyGuard Heritage Vault. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
