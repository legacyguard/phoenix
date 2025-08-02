import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: 'free' | 'premium';
  avatar?: string;
}

export interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: string;
  
  // Document state
  documents: any[];
  selectedDocument: any | null;
  
  // Error state
  error: string | null;
}

export interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  
  // UI actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  
  // Document actions
  setDocuments: (documents: any[]) => void;
  setSelectedDocument: (document: any | null) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sidebarOpen: true,
  theme: 'light',
  language: 'en',
  documents: [],
  selectedDocument: null,
  error: null,
};

// Create store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // User actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (loading) => set({ isLoading: loading }),
        logout: () => set({ user: null, isAuthenticated: false }),
        
        // UI actions
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        
        // Document actions
        setDocuments: (documents) => set({ documents }),
        setSelectedDocument: (document) => set({ selectedDocument: document }),
        
        // Error actions
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useDocuments = () => useAppStore((state) => state.documents);
export const useSelectedDocument = () => useAppStore((state) => state.selectedDocument);
export const useError = () => useAppStore((state) => state.error);

export default useAppStore;