import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignUp 
          routing="path" 
          path="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none bg-transparent",
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
