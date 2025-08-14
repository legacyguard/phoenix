function generateUUID(): string {
  // RFC4122 v4 compatible
  // Using crypto.getRandomValues for strong randomness
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const b = Array.from(bytes).map(toHex);
  return `${b[0]}${b[1]}${b[2]}${b[3]}-${b[4]}${b[5]}-${b[6]}${b[7]}-${b[8]}${b[9]}-${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}`;
}

const DEVICE_ID_KEY = 'deviceId_v1';

export const DeviceService = {
  getOrCreateDeviceId(): string {
    try {
      const existing = localStorage.getItem(DEVICE_ID_KEY);
      if (existing) return existing;
    } catch {}
    const id = generateUUID();
    try { localStorage.setItem(DEVICE_ID_KEY, id); } catch {}
    return id;
  },
};


