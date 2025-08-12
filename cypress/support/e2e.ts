import './commands';

/** Unregister service workers to avoid PWA cache issues in tests */
function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then(regs => {
      regs.forEach(r => r.unregister().catch(()=>{}));
    }).catch(()=>{});
  }
}
before(() => unregisterServiceWorkers());

// === e2e global stubs (auto) ===
beforeEach(() => {
  cy.on("window:before:load", (win) => { (win as any).__E2E__ = true; });
  // default allow for any /api/** — vráť minimálne tvary, aby UI niečo vykreslilo
  cy.intercept({ url: "**/api/**", method: /GET|POST|PUT|PATCH|DELETE/ }, (req) => {
    const url = req.url;
    // heuristiky na základné entity
    if (/will\/.+preview/.test(url)) return req.reply({ statusCode: 200, body: { pdfUrl: "/dummy.pdf" } });
    if (/vault/.test(url))       return req.reply({ statusCode: 200, body: { items: [] } });
    if (/ocr/.test(url))         return req.reply({ statusCode: 200, body: { text: "Sample OCR text" } });
    if (/time-?capsule/.test(url)) return req.reply({ statusCode: 200, body: { items: [] } });
    if (/dms|dead-?man|check-in/.test(url)) return req.reply({ statusCode: 200, body: { ok: true } });
    return req.reply({ statusCode: 200, body: {} });
  });
});

Cypress.on("uncaught:exception", (err) => {
  // nezabíjaj smoke na random chybách, ale loguj do konzoly
  console.error("[SMOKE] uncaught", err.message);
  return false;
});

Cypress.Commands.add("appReady", () => {
  cy.document().its("readyState").should("eq","complete");
  cy.get("body").should("be.visible");
  // počkaj na React mount
  cy.get("#root, main, [data-testid]").should("exist");
});

// === mount probe helpers ===
Cypress.Commands.add("dumpDom", (label: string) => {
  cy.document().then((doc) => {
    const html = doc.documentElement?.outerHTML || "";
    const file = `${Cypress.config("projectRoot")}/_e2e_diag_20250812_172537/dom_${label.replace(/\W+/g,"_")}.html`;
    cy.writeFile(file, html, { log:false });
  });
});

Cypress.Commands.add("mountOk", () => {
  return cy.window().then(w => Boolean((w as any).__MOUNT_OK__));
});

// === E2E DIAG: AUT DOM dump + console capture ===
Cypress.Commands.add("captureConsole", (label: string) => {
  cy.window().then((win) => {
    try {
      const log = (win as any).__E2E_CONSOLE__ || [];
      const file = `${Cypress.config("projectRoot")}/_e2e_diag_20250812_172537/console_${label.replace(/\W+/g,"_")}.json`;
      cy.writeFile(file, JSON.stringify(log,null,2), { log:false });
    } catch {}
  });
});

beforeEach(() => {
  cy.on("window:before:load", (win) => {
    (win as any).__E2E__ = true;
    const buf: any[] = [];
    const wrap = (lvl: keyof Console) => {
      const orig = (win.console as any)[lvl];
      (win.console as any)[lvl] = function(...args:any[]){
        try { buf.push({ t: Date.now(), lvl, args: args.map(a=>{ try { return typeof a==='string'?a:JSON.stringify(a); } catch { return String(a);} }) }); } catch {}
        return orig && orig.apply(this, args);
      };
    };
    ['error','warn','log'].forEach(wrap as any);
    (win as any).__E2E_CONSOLE__ = buf;
  });
});
