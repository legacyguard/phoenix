const isProduction = (() => {
  try {
    // Vite/Browser environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta: any = import.meta;
    if (meta && meta.env && typeof meta.env.PROD === 'boolean') {
      return meta.env.PROD as boolean;
    }
  } catch {
    // ignore, fallback to process.env
  }
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
})();

const debugEnabled = (() => {
  try {
    // Vite/Browser environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta: any = import.meta;
    if (meta && meta.env && typeof meta.env.VITE_ENABLE_DEBUG !== 'undefined') {
      return meta.env.VITE_ENABLE_DEBUG === 'true';
    }
  } catch {
    // ignore, fallback to process.env
  }
  if (typeof process !== 'undefined' && typeof process.env.ENABLE_DEBUG !== 'undefined') {
    return process.env.ENABLE_DEBUG === 'true';
  }
  return !isProduction;
})();

export const logger = {
  info: (...args: unknown[]): void => {
    if (debugEnabled) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (debugEnabled) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  group: (...args: unknown[]): void => {
    if (debugEnabled) {
      console.group(...args);
    }
  },
  groupEnd: (): void => {
    if (debugEnabled) {
      console.groupEnd();
    }
  },
};

export default logger;
