import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/fonts.css';
import './styles/app.css';
import './styles/shell.css';
import './styles/home.css';
import './styles/notebook.css';
import './styles/print.css';
import { repository } from './store/repository.js';
import { seedIfEmpty } from './store/seed.js';
import { App } from './router.jsx';

const root = createRoot(document.getElementById('root'));

// Wording approved by Mark (2026-10-11): decide-boot-blocked-line.
const STORE_BLOCKED_LINE = 'Close other Sprinkles tabs to finish updating.';

root.render(<p className="app-boot">Opening your recipes…</p>);

// Another tab on an older database version holds the upgrade up (WR-08): say
// what to do. The open then finishes on its own once that tab closes.
repository.onBlocked(() => {
  root.render(<p className="app-boot">{STORE_BLOCKED_LINE}</p>);
});

try {
  await seedIfEmpty(repository);
} catch (err) {
  root.render(<p className="app-boot">Could not open the local store. Try reloading.</p>);
  throw err;
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
