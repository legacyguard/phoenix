import React, { useEffect } from 'react';

function visibleCount(root: HTMLElement): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let count = 0;
  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (['script','style','link','meta','head'].includes(tag)) continue;
    const rect = el.getBoundingClientRect?.();
    const hasBox = rect && (rect.width>0 || rect.height>0);
    if (hasBox) count++;
  }
  return count;
}

export default function E2EAppProbe({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const w:any = window as any;
    w.__APP_PROBE__ = { started: Date.now(), visible: 0, notes: [] as string[] };
    const root = document.getElementById('root')!;
    const mark = (label:string) => {
      try {
        const v = visibleCount(root);
        w.__APP_PROBE__.visible = v;
        w.__APP_VISIBLE__ = v > 0;
        w.__APP_STAGE__ = label;
        console.log('[APP-PROBE]', label, 'visibleNodes=', v);
      } catch(e:any){ console.warn('[APP-PROBE-ERR]', e?.message||e); }
    };
    mark('after-mount');
    const mo = new MutationObserver(() => mark('mutation'));
    mo.observe(root, {childList:true, subtree:true});
    setTimeout(()=>{ mark('t+800ms'); }, 800);
    return () => mo.disconnect();
  }, []);
  return <>{children}</>;
}
