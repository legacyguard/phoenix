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
import SettingsPrivacy from "@/pages/SettingsPrivacy";
import SettingsPrivacyPassphrase from "@/pages/SettingsPrivacyPassphrase";
import { runSecureStorageMigration } from "@/services/MigrationService";
import { KeyService } from "@/services/KeyService";
import { HeartbeatService } from "@/services/HeartbeatService";
import { CloudSyncService } from "@/services/CloudSyncService";

const queryClient = new QueryClient();
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

const RouterShell: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    HeartbeatService.touch('web');
    (async () => { try { await runSecureStorageMigration(); } catch {} })();
  }, []);

  // Gentle unlock modal
  const [showUnlock, setShowUnlock] = React.useState<boolean>(() => KeyService.hasPassphrase());
  const [unlockPass, setUnlockPass] = React.useState('');
  useEffect(() => {
    // kick initial sync after mount and after unlock
    const prefs = PreferencesService.get?.() || undefined;
    const runAll = async () => {
      try {
        await Promise.all([
          CloudSyncService.syncCategory('reminders').catch(() => {}),
          CloudSyncService.syncCategory('documents').catch(() => {}),
          CloudSyncService.syncCategory('preferences').catch(() => {}),
        ]);
      } catch {}
    };
    runAll();
    const iv = window.setInterval(runAll, 10 * 60 * 1000);
    return () => { window.clearInterval(iv); };
  }, [showUnlock]);
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
              <li><Link to="/settings/privacy">Privacy</Link></li>
              <li><Link to="/settings/privacy/passphrase">Passphrase</Link></li>
            </ul>
          </nav>
          {showUnlock && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', padding: 16, borderRadius: 8, width: 360, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                <h3>Odomknúť dáta</h3>
                <p style={{ color: '#555' }}>Zadajte passphrase pre prístup k šifrovaným dátam.</p>
                <input
                  type="password"
                  value={unlockPass}
                  onChange={(e) => setUnlockPass(e.target.value)}
                  placeholder="Passphrase"
                  style={{ width: '100%', padding: 8, border: '1px solid #ddd' }}
                />
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setShowUnlock(false)} style={{ background: 'transparent', border: '1px solid #ddd', padding: '6px 10px' }}>Neskôr</button>
                  <button
                    onClick={async () => {
                      try { await KeyService.unlock(unlockPass); setShowUnlock(false); CloudSyncService.schedule('reminders', 30000); CloudSyncService.schedule('documents', 30000); CloudSyncService.schedule('preferences', 30000); } catch {}
                    }}
                    disabled={!unlockPass}
                    style={{ background: '#0353a4', color: '#fff', border: 'none', padding: '6px 10px' }}
                  >
                    Odomknúť
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <Route path="/settings/privacy" element={<SettingsPrivacy />} />
            <Route path="/settings/privacy/passphrase" element={<SettingsPrivacyPassphrase />} />
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
