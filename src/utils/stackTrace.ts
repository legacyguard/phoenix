/**
 * Utility funkcie pre prácu so stack traces
 */

interface StackFrame {
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  source?: string;
}

/**
 * Parsuje stack trace string na štruktúrované dáta
 */
export function parseStackTrace(stack: string): StackFrame[] {
  if (!stack) return [];

  const lines = stack.split('\n');
  const frames: StackFrame[] = [];

  // Regex patterns pre rôzne formáty stack traces
  const chromeRegex = /^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/;
  const chromeEvalRegex = /^\s*at\s+(.+?)\s+\(eval\s+at\s+.+?\),\s+(.+?):(\d+):(\d+)\)$/;
  const firefoxRegex = /^\s*(.+?)@(.+?):(\d+):(\d+)$/;
  const safariRegex = /^\s*(.+?)@(.+?):(\d+):(\d+)$/;

  for (const line of lines) {
    let match;
    let frame: StackFrame = {};

    // Chrome/Node.js format
    if ((match = chromeRegex.exec(line)) || (match = chromeEvalRegex.exec(line))) {
      frame = {
        functionName: match[1],
        fileName: match[2],
        lineNumber: parseInt(match[3], 10),
        columnNumber: parseInt(match[4], 10),
        source: line
      };
    }
    // Firefox format
    else if ((match = firefoxRegex.exec(line))) {
      frame = {
        functionName: match[1],
        fileName: match[2],
        lineNumber: parseInt(match[3], 10),
        columnNumber: parseInt(match[4], 10),
        source: line
      };
    }
    // Safari format
    else if ((match = safariRegex.exec(line))) {
      frame = {
        functionName: match[1],
        fileName: match[2],
        lineNumber: parseInt(match[3], 10),
        columnNumber: parseInt(match[4], 10),
        source: line
      };
    }
    // Jednoduchý formát bez zátvorkiek
    else if (line.includes('@')) {
      const parts = line.split('@');
      if (parts.length === 2) {
        const locationParts = parts[1].split(':');
        frame = {
          functionName: parts[0].trim(),
          fileName: locationParts[0],
          lineNumber: locationParts[1] ? parseInt(locationParts[1], 10) : undefined,
          columnNumber: locationParts[2] ? parseInt(locationParts[2], 10) : undefined,
          source: line
        };
      }
    }

    if (frame.fileName) {
      frames.push(frame);
    }
  }

  return frames;
}

/**
 * Formátuje stack frame na čitateľný string
 */
export function formatStackFrame(frame: StackFrame): string {
  const { functionName, fileName, lineNumber, columnNumber } = frame;
  
  let result = functionName || '<anonymous>';
  
  if (fileName) {
    // Skrátiť dlhé cesty k súborom
    const shortFileName = fileName.replace(/^.*\/node_modules\//, '~/');
    result += ` (${shortFileName}`;
    
    if (lineNumber) {
      result += `:${lineNumber}`;
      if (columnNumber) {
        result += `:${columnNumber}`;
      }
    }
    
    result += ')';
  }
  
  return result;
}

/**
 * Filtruje stack frames podľa kritérií
 */
export function filterStackFrames(
  frames: StackFrame[],
  options: {
    excludeNodeModules?: boolean;
    excludeNative?: boolean;
    includeOnly?: string[];
  } = {}
): StackFrame[] {
  const { 
    excludeNodeModules = true, 
    excludeNative = true,
    includeOnly = []
  } = options;

  return frames.filter(frame => {
    if (!frame.fileName) return !excludeNative;

    // Vylúčiť node_modules
    if (excludeNodeModules && frame.fileName.includes('node_modules')) {
      return false;
    }

    // Vylúčiť natívne funkcie
    if (excludeNative && frame.fileName.startsWith('native')) {
      return false;
    }

    // Ak je špecifikovaný zoznam, zahrnúť len tie
    if (includeOnly.length > 0) {
      return includeOnly.some(pattern => frame.fileName!.includes(pattern));
    }

    return true;
  });
}

/**
 * Vylepšuje Error objekt s dodatočnými informáciami
 */
export function enhanceError(
  error: Error,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): Error & { enhanced: boolean; context?: any } {
  const enhanced = error as Error & { enhanced: boolean; context?: any };
  
  if (enhanced.enhanced) {
    return enhanced;
  }

  // Pridať kontext
  enhanced.context = {
    ...context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Označiť ako vylepšený
  enhanced.enhanced = true;

  // Ak chýba stack trace, vytvoriť ho
  if (!enhanced.stack) {
    Error.captureStackTrace(enhanced, enhanceError);
  }

  return enhanced;
}

/**
 * Získa súhrn o chybe pre rýchle zobrazenie
 */
export function getErrorSummary(error: Error): {
  type: string;
  message: string;
  component?: string;
  line?: string;
} {
  const frames = parseStackTrace(error.stack || '');
  const relevantFrame = frames.find(f => 
    f.fileName && 
    !f.fileName.includes('node_modules') &&
    !f.fileName.startsWith('native')
  );

  return {
    type: error.name,
    message: error.message,
    component: relevantFrame?.functionName,
    line: relevantFrame ? `${relevantFrame.fileName}:${relevantFrame.lineNumber}` : undefined
  };
}

/**
 * Serializuje Error objekt pre odoslanie alebo uloženie
 */
export function serializeError(error: Error): Record<string, any> {
  const serialized: Record<string, any> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  // Pridať vlastné vlastnosti
  for (const key in error) {
    if (error.hasOwnProperty(key) && !serialized[key]) {
      serialized[key] = (error as any)[key];
    }
  }

  // Pridať parsed stack trace
  if (error.stack) {
    serialized.parsedStack = parseStackTrace(error.stack);
  }

  return serialized;
}

/**
 * Vytvorí Error objekt z rôznych typov vstupov
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null) {
    const err = new Error((error as any).message || 'Unknown error');
    Object.assign(err, error);
    return err;
  }

  return new Error(String(error));
}
