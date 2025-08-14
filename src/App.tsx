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
import { InactivityService } from "@/services/InactivityService";
import { PreferencesService } from "@/services/PreferencesService";
import { LockGuard } from "@/services/LockGuard";
import UnlockModal from "@/components/UnlockModal";
import { LocalDataAdapter } from "@/services/LocalDataAdapter";

const queryClient = new QueryClient();
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

const RouterShell: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    HeartbeatService.touch('web');
    (async () => { try { await runSecureStorageMigration(); } catch {} })();
    // Repair encrypted indexes silently
    try {
      LocalDataAdapter.repairIndex('reminders');
      LocalDataAdapter.repairIndex('documents');
      LocalDataAdapter.repairIndex('preferences');
    } catch {}
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

  useEffect(() => {
    // Inactivity auto-lock start
    const prefs = PreferencesService.get();
    const mins = Math.min(Math.max(prefs.autoLockMinutes || 15, 5), 120);
    const enabled = prefs.autoLockEnabled !== false;
    InactivityService.start(enabled ? mins * 60 * 1000 : Infinity, () => {
      KeyService.lock();
      CloudSyncService.stopInterval();
      setShowUnlock(KeyService.hasPassphrase());
    });
    const poke = () => InactivityService.poke();
    document.addEventListener('pointerdown', poke, { passive: true });
    document.addEventListener('keydown', poke as any);
    document.addEventListener('visibilitychange', poke as any);
    return () => {
      InactivityService.stop();
      document.removeEventListener('pointerdown', poke as any);
      document.removeEventListener('keydown', poke as any);
      document.removeEventListener('visibilitychange', poke as any);
    };
  }, []);

  // Central lock handler
  useEffect(() => {
    const onLock = () => setShowUnlock(true);
    LockGuard.addLockListener(onLock);
    return () => { LockGuard.removeLockListener(onLock); };
  }, []);
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
          <UnlockModal
            open={showUnlock}
            onClose={() => setShowUnlock(false)}
            onUnlock={async (pp) => { try { await KeyService.unlock(pp); setShowUnlock(false); await CloudSyncService.runOnceAllEnabledCategories(); CloudSyncService.startInterval(); } catch {} }}
          />
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
