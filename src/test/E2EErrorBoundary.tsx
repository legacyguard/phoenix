import React from 'react';

export class E2EErrorBoundary extends React.Component<{children: React.ReactNode},{err?:Error, info?:any}>{
  constructor(p:any){ super(p); this.state={}; }
  static getDerivedStateFromError(err:Error){ return {err}; }
  componentDidCatch(err:Error, info:any){
    (window as any).__E2E_ERRORS__ = ((window as any).__E2E_ERRORS__||[]);
    (window as any).__E2E_ERRORS__.push({ message: err?.message, stack: String(err?.stack||''), info });
    console.error('[E2E-ERR]', err?.message);
  }
  render(){
    if(this.state.err){
      return (
        <div data-testid="e2e-error" style={{padding:'12px',border:'1px solid #f00',color:'#900',background:'#fee'}}>
          <strong>E2E ErrorBoundary:</strong> {String(this.state.err?.message||'')}
        </div>
      );
    }
    return this.props.children;
  }
}
