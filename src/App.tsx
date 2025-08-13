import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import "./i18n";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Vault from "@/pages/Vault";
import Onboarding from "@/pages/Onboarding";
import TrustedCircle from "@/pages/TrustedCircle";
import GenerateWill from "@/pages/GenerateWill";
import InventoryWizard from "@/pages/InventoryWizard";
import Playbook from "@/pages/Playbook";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import PersonalizedOnboarding from "@/pages/PersonalizedOnboarding";
import Settings from "@/pages/Settings";
import { HeartbeatService } from "@/services/HeartbeatService";

const queryClient = new QueryClient();
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

const RouterShell: React.FC = () => {
  const location = useLocation();
  useEffect(() => { HeartbeatService.touch('web'); }, []);
  useEffect(() => { HeartbeatService.touch('web'); }, [location.pathname]);
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <nav style={{ padding: 12, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
            <ul style={{ display: "flex", listStyle: "none", gap: 12, margin: 0, padding: 0 }}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/vault">Vault</Link></li>
              <li><Link to="/onboarding">Onboarding</Link></li>
              <li><Link to="/trusted-circle">Trusted Circle</Link></li>
              <li><Link to="/generate-will">Generate Will</Link></li>
              <li><Link to="/inventory">Life Inventory</Link></li>
              <li><Link to="/playbook">Guardian’s Playbook</Link></li>
              <li><Link to="/document-analysis">AI Document Analysis</Link></li>
              <li><Link to="/personal-onboarding">Personalized Setup</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/trusted-circle" element={<TrustedCircle />} />
            <Route path="/generate-will" element={<GenerateWill />} />
            <Route path="/inventory" element={<InventoryWizard />} />
            <Route path="/playbook" element={<Playbook />} />
            <Route path="/document-analysis" element={<DocumentAnalysis />} />
            <Route path="/personal-onboarding" element={<PersonalizedOnboarding />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <RouterShell />
  </BrowserRouter>
);

export default App;
