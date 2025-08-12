import React from 'react';
import { E2EErrorBoundary } from './E2EErrorBoundary';

export default function E2EShell(){
  return (
    <E2EErrorBoundary>
      <div data-testid="e2e-shell" style={{fontFamily:'system-ui',padding:16}}>
        <h1>LegacyGuard — E2E Shell</h1>
        <p>Táto obrazovka je renderovaná len v E2E FORCE_SHELL režime.</p>
        <nav style={{display:'grid',gap:8,gridTemplateColumns:'repeat(3,minmax(0,1fr))',maxWidth:720}}>
          <a href="/"            data-testid="nav-home"><button>Home</button></a>
          <a href="/dashboard"   data-testid="nav-dashboard"><button>Dashboard</button></a>
          <a href="/upload-demo" data-testid="nav-upload"><button>Upload demo</button></a>
          <a href="/will"        data-testid="nav-will"><button>Will</button></a>
          <a href="/legacy-letters" data-testid="nav-capsule"><button>Time Capsule</button></a>
          <a href="/guardian-view"  data-testid="nav-dms"><button>DMS</button></a>
        </nav>
        <div style={{marginTop:12}}>
          <label>Dummy input: <input placeholder="type here" /></label>
        </div>
      </div>
    </E2EErrorBoundary>
  );
}
