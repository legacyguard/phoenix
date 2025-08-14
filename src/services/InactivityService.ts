type TimeoutHandle = number | null;

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

let timer: TimeoutHandle = null;
let timeoutMsCurrent = DEFAULT_TIMEOUT_MS;
let onTimeoutCb: (() => void) | null = null;
let listenersAttached = false;

function clearTimer() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
}

function armTimer() {
  clearTimer();
  if (!Number.isFinite(timeoutMsCurrent) || timeoutMsCurrent === Infinity) return;
  timer = window.setTimeout(() => {
    timer = null;
    if (onTimeoutCb) onTimeoutCb();
  }, timeoutMsCurrent);
}

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  const poke = () => InactivityService.poke();
  document.addEventListener('pointerdown', poke, { passive: true });
  document.addEventListener('keydown', poke, { passive: true } as any);
  document.addEventListener('visibilitychange', poke, { passive: true } as any);
}

function detachListeners() {
  if (!listenersAttached) return;
  listenersAttached = false;
  const poke = () => InactivityService.poke();
  document.removeEventListener('pointerdown', poke as any);
  document.removeEventListener('keydown', poke as any);
  document.removeEventListener('visibilitychange', poke as any);
}

export const InactivityService = {
  start(timeoutMs: number, onTimeout: () => void) {
    timeoutMsCurrent = timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
    onTimeoutCb = onTimeout;
    attachListeners();
    armTimer();
  },
  poke() {
    armTimer();
  },
  stop() {
    clearTimer();
    detachListeners();
    onTimeoutCb = null;
  },
  getDefaultTimeoutMs() {
    return DEFAULT_TIMEOUT_MS;
  },
};


