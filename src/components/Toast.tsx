import React from "react";

type ToastProps = {
  message: string;
  visible: boolean;
  onClose?: () => void;
};

export default function Toast({ message, visible, onClose }: ToastProps) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        maxWidth: 360,
        background: "#f7fafc",
        color: "#1a202c",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: 14,
        lineHeight: 1.4,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ marginTop: 2 }}>✓</div>
        <div style={{ flex: 1 }}>{message}</div>
        <button
          aria-label="Zavrieť oznámenie"
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}


