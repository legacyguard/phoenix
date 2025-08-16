import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock pre react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  BrowserRouter: ({ children }: any) => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'browser-router' }, children);
  },
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => {
    const { createElement } = require('react');
    return createElement('a', { href: to, ...props }, children);
  },
  NavLink: ({ children, to, ...props }: any) => {
    const { createElement } = require('react');
    return createElement('a', { href: to, ...props }, children);
  },
}));

// Mock pre Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    isSignedIn: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
  }),
  useUser: () => ({
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg',
  }),
  ClerkProvider: ({ children }: any) => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'clerk-provider' }, children);
  },
  SignIn: () => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'sign-in' }, 'Sign In');
  },
  SignUp: () => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'sign-up' }, 'Sign Up');
  },
  UserButton: () => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'user-button' }, 'User Button');
  },
}));

// Mock pre matchMedia (potrebné pre responsive komponenty)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock pre ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pre IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pre window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock pre console.error aby sa nezobrazovali warning-y v testoch
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
