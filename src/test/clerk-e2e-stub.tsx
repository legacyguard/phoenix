import type { PropsWithChildren, ReactNode } from 'react';

const isE2E = typeof window !== 'undefined' && (window as any).__E2E__ === true;
function passthrough(children: ReactNode){ return <>{children}</>; }

// Core provider and wrapper components
export function ClerkProvider(p: PropsWithChildren<any>) { return <>{p.children}</>; }
export function SignedIn(p: PropsWithChildren<any>) { return passthrough(p.children); }
export function SignedOut(_p: PropsWithChildren<any>) { return null; }
export function RedirectToSignIn(){ return null; }

// Authentication components
export function SignIn(_p: any) { return <div>Sign In (E2E Mock)</div>; }
export function SignUp(_p: any) { return <div>Sign Up (E2E Mock)</div>; }
export function UserButton(_p: any) { return <div>User (E2E Mock)</div>; }
export function SignInButton(_p: any) { return <button>Sign In (E2E Mock)</button>; }
export function SignUpButton(_p: any) { return <button>Sign Up (E2E Mock)</button>; }
export function UserProfile(_p: any) { return <div>User Profile (E2E Mock)</div>; }

// Hooks
export function useUser(){
  return { 
    isSignedIn: true, 
    user: { 
      id: 'e2e-user-id', 
      fullName: 'E2E Test User', 
      primaryEmailAddress: { emailAddress: 'e2e@example.com' },
      firstName: 'E2E',
      lastName: 'User',
      imageUrl: '/placeholder.svg'
    } 
  };
}

export function useAuth(){
  return { 
    isSignedIn: true, 
    getToken: async ()=>'e2e-mock-token', 
    signOut: async ()=>{},
    userId: 'e2e-user-id'
  };
}

// Mock any other Clerk exports that might be used
export const clerkClient = {
  users: {
    getUser: async () => ({ id: 'e2e-user-id', fullName: 'E2E Test User' })
  }
};
