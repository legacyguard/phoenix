import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

const LandingSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Welcome to Phoenix
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your premium digital estate planning platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/sign-in">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Secure</h3>
            <p className="text-muted-foreground">
              Your data is protected with enterprise-grade security
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Simple</h3>
            <p className="text-muted-foreground">
              Easy to use interface designed for everyone
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Comprehensive</h3>
            <p className="text-muted-foreground">
              Everything you need for digital estate planning
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to secure your legacy?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of families who trust Phoenix
          </p>
          <Link to="/sign-up">
            <Button size="lg" className="font-semibold">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingSimple;
