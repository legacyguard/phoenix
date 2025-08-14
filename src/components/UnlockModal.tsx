import React, { useEffect, useRef, useState } from 'react';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  onUnlock: (passphrase: string) => Promise<void> | void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ open, onClose, onUnlock }) => {
  const [pass, setPass] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevFocused = useRef<HTMLElement | null>(null);
  const titleId = 'unlock-modal-title';
  const descId = 'unlock-modal-desc';

  useEffect(() => {
    if (!open) return;
    prevFocused.current = (document.activeElement as HTMLElement) || null;
    document.body.classList.add('modal-open');
    const el = inputRef.current;
    if (el) el.focus();
    return () => {
      document.body.classList.remove('modal-open');
      if (prevFocused.current) {
        try { prevFocused.current.focus(); } catch {}
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pass) void onUnlock(pass);
      } else if (e.key === 'Tab') {
        // Focus trap
        const container = containerRef.current;
        if (!container) return;
        const focusables = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input[type="text"], input[type="password"], input[type="email"], input[type="number"], select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, pass, onClose, onUnlock]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div ref={containerRef} style={{ background: '#fff', padding: 16, borderRadius: 8, width: 360, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <h3 id={titleId}>Odomknúť dáta</h3>
        <p id={descId} style={{ color: '#555' }}>Zadajte passphrase pre prístup k šifrovaným dátam.</p>
        <input
          ref={inputRef}
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Passphrase"
          aria-label="Passphrase"
          style={{ width: '100%', padding: 8, border: '1px solid #ddd' }}
        />
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #ddd', padding: '6px 10px' }}>Neskôr</button>
          <button
            onClick={() => { if (pass) void onUnlock(pass); }}
            disabled={!pass}
            style={{ background: '#0353a4', color: '#fff', border: 'none', padding: '6px 10px' }}
          >
            Odomknúť
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockModal;


