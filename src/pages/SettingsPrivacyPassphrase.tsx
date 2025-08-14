import React, { useEffect, useState } from 'react';
import { KeyService } from '@/services/KeyService';

const PasswordMeter: React.FC<{ value: string }> = ({ value }) => {
  const score = Math.min(4, Math.floor((value.length || 0) / 4));
  const colors = ['#ccc', '#d97706', '#f59e0b', '#10b981', '#059669'];
  const labels = ['very weak', 'weak', 'ok', 'good', 'strong'];
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${(score + 1) * 20}%`, height: 6, background: colors[score] }} />
      </div>
      <small style={{ color: '#666' }}>{labels[score]}</small>
    </div>
  );
};

const SettingsPrivacyPassphrase: React.FC = () => {
  const [has, setHas] = useState<boolean>(KeyService.hasPassphrase());
  const [setPass, setSetPass] = useState('');
  const [setPass2, setSetPass2] = useState('');
  const [chgOld, setChgOld] = useState('');
  const [chgNew, setChgNew] = useState('');
  const [chgNew2, setChgNew2] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setHas(KeyService.hasPassphrase());
  }, []);

  async function handleSet() {
    setMsg(null);
    if (!setPass || setPass !== setPass2) { setMsg('Passphrase mismatch'); return; }
    try {
      await KeyService.setPassphrase(setPass);
      setHas(true);
      setMsg('Passphrase set and unlocked.');
    } catch (e) {
      setMsg('Failed to set passphrase');
    }
  }

  async function handleChange() {
    setMsg(null);
    if (!chgOld || !chgNew || chgNew !== chgNew2) { setMsg('Invalid input'); return; }
    try {
      await KeyService.changePassphrase(chgOld, chgNew);
      setMsg('Passphrase changed. Still unlocked.');
    } catch (e) {
      setMsg('Failed to change passphrase');
    }
  }

  function handleLock() {
    KeyService.lock();
    setMsg('Locked. You will need to unlock to access encrypted data.');
  }

  return (
    <div>
      <h1>Passphrase</h1>
      <p style={{ color: '#555' }}>Cloud sync vyžaduje nastavenú passphrase. DEK je držaný len v pamäti.</p>
      {msg && <div style={{ marginBottom: 8, color: '#0353a4' }}>{msg}</div>}

      {!has ? (
        <section style={{ marginTop: 12 }}>
          <h2>Set passphrase</h2>
          <div>
            <input type="password" placeholder="Passphrase" value={setPass} onChange={(e) => setSetPass(e.target.value)} />
            <PasswordMeter value={setPass} />
          </div>
          <div style={{ marginTop: 8 }}>
            <input type="password" placeholder="Confirm" value={setPass2} onChange={(e) => setSetPass2(e.target.value)} />
          </div>
          <button style={{ marginTop: 8 }} onClick={handleSet} disabled={!setPass || setPass !== setPass2}>Set passphrase</button>
        </section>
      ) : (
        <section style={{ marginTop: 12 }}>
          <h2>Change passphrase</h2>
          <div>
            <input type="password" placeholder="Old passphrase" value={chgOld} onChange={(e) => setChgOld(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <input type="password" placeholder="New passphrase" value={chgNew} onChange={(e) => setChgNew(e.target.value)} />
            <PasswordMeter value={chgNew} />
          </div>
          <div style={{ marginTop: 8 }}>
            <input type="password" placeholder="Confirm new" value={chgNew2} onChange={(e) => setChgNew2(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={handleChange} disabled={!chgOld || !chgNew || chgNew !== chgNew2}>Change</button>
            <button onClick={handleLock} style={{ marginLeft: 8 }}>Lock now</button>
          </div>
        </section>
      )}
    </div>
  );
};

export default SettingsPrivacyPassphrase;


