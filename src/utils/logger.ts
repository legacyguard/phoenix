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

export const logger = {
  info: (...args: unknown[]): void => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  group: (...args: unknown[]): void => {
    if (!isProduction) {
      console.group(...args);
    }
  },
  groupEnd: (): void => {
    if (!isProduction) {
      console.groupEnd();
    }
  },
};

export default logger;
