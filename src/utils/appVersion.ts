// Build-time injected version if available, else fallback to "dev"
// Vite exposes import.meta.env; during tests this may be undefined.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const injected = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_VERSION) || undefined;

export const APP_VERSION: string = typeof injected === 'string' && injected.length > 0 ? injected : 'dev';


