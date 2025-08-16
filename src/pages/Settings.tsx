import React, { useEffect, useState } from "react";
import { PreferencesService, type AppPreferences } from "@/services/PreferencesService";
import { DebugService } from "@/services/DebugService";

const Settings: React.FC = () => {
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);

  useEffect(() => {
    setPrefs(PreferencesService.get());
  }, []);

  if (!prefs) return <div>Loading…</div>;

  const update = (patch: Partial<AppPreferences>) => {
    const updated = PreferencesService.set(patch);
    setPrefs(updated);
  };

  return (
    <div>
      <h1>Settings</h1>
      <p style={{ color: "#555" }}>
        These settings only affect in-app notifications. Email/SMS will come later.
      </p>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <label>
          <input
            type="checkbox"
            checked={prefs.deadManSwitchEnabled}
            onChange={(e) => update({ deadManSwitchEnabled: e.target.checked })}
          />
          {" "}Dead-man switch (request presence confirmation after inactivity)
        </label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <label>Days of inactivity</label>{" "}
            <input
              type="number"
              min={7}
              max={365}
              value={prefs.inactivityDays}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 7 && v <= 365) update({ inactivityDays: v });
              }}
            />
            {(prefs.inactivityDays < 7 || prefs.inactivityDays > 365) && (
              <small style={{ color: 'crimson' }}>Range 7-365 days.</small>
            )}
          </div>
          <div>
            <label>Grace (hours)</label>{" "}
            <input
              type="number"
              min={0}
              max={48}
              value={prefs.inactivityGraceHours}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 0 && v <= 48) update({ inactivityGraceHours: v });
              }}
            />
            {(prefs.inactivityGraceHours < 0 || prefs.inactivityGraceHours > 48) && (
              <small style={{ color: 'crimson' }}>Range 0-48 hours.</small>
            )}
          </div>
        </div>
        <label>
          <input
            type="checkbox"
            checked={prefs.nudgesEnabled}
            onChange={(e) => update({ nudgesEnabled: e.target.checked })}
          />
          {" "}Motivational nudge banner
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.expirationBannerEnabled}
            onChange={(e) => update({ expirationBannerEnabled: e.target.checked })}
          />
          {" "}Expiration banner
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.completionToastEnabled}
            onChange={(e) => update({ completionToastEnabled: e.target.checked })}
          />
          {" "}Toast when marking task as completed
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.metadataToastsEnabled}
            onChange={(e) => update({ metadataToastsEnabled: e.target.checked })}
          />
          {" "}Toasts when working with metadata
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.quietHoursEnabled}
            onChange={(e) => update({ quietHoursEnabled: e.target.checked })}
          />
          {" "}Quiet hours
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <label>Start:</label>
            <input
              type="time"
              value={prefs.quietHoursStart}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d{2}:\d{2}$/.test(v)) update({ quietHoursStart: v });
              }}
            />
          </div>
          <div>
            <label>End:</label>
            <input
              type="time"
              value={prefs.quietHoursEnd}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d{2}:\d{2}$/.test(v)) update({ quietHoursEnd: v });
              }}
            />
          </div>
        </div>
        {(!/^\d{2}:\d{2}$/.test(prefs.quietHoursStart) || !/^\d{2}:\d{2}$/.test(prefs.quietHoursEnd)) && (
          <small style={{ color: "crimson" }}>Please use HH:MM format.</small>
        )}

        <hr />
        <label>
          <input
            type="checkbox"
            checked={prefs.remindersEnabled}
            onChange={(e) => update({ remindersEnabled: e.target.checked })}
          />
          {" "}Task reminders (in app)
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.dailyDigestEnabled}
            onChange={(e) => update({ dailyDigestEnabled: e.target.checked })}
          />
          {" "}Daily digest
        </label>
        <div>
          <label>Digest time:</label>{" "}
          <input
            type="time"
            value={prefs.dailyDigestTime}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d{2}:\d{2}$/.test(v)) update({ dailyDigestTime: v });
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <a href="/settings/privacy" style={{ color: '#0353a4' }}>Privacy & Data Control</a>
      </div>
      {process.env.NODE_ENV !== 'production' && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => {
              if (confirm('Reset local data?')) { DebugService.resetAllLocalData(); window.location.reload(); }
            }}
          >
            Reset local data
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;


