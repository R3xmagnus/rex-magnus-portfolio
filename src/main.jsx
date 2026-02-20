import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Community from './Community.jsx'

// ── Simple page store ──────────────────────────
let _setPage = null;

export function navigate(path) {
  window.history.pushState({}, '', path);
  if (_setPage) _setPage(path === '/community' ? 'community' : 'portfolio');
}

// Make it globally accessible for inline onClick handlers
window.__navigate = navigate;

// ── Root component ─────────────────────────────
function Root() {
  const [page, setPage] = useState(
    window.location.pathname === '/community' ? 'community' : 'portfolio'
  );

  // Keep the setter reference up to date
  _setPage = setPage;

  useEffect(() => {
    const onPop = () => {
      setPage(window.location.pathname === '/community' ? 'community' : 'portfolio');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return page === 'community' ? <Community /> : <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
