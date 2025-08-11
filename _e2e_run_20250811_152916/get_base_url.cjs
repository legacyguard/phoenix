let base = '';
try { const cfg = require('./cypress.config.cjs'); base = (cfg?.e2e?.baseUrl || cfg?.baseUrl || ''); } catch {}
process.stdout.write(base);
