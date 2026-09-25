import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/fonts.css';
import './styles/app.css';
import './styles/shell.css';
import './styles/history.css';
import './styles/home.css';
import './styles/notebook.css';
import { repository } from './store/repository.js';
import { seedIfEmpty } from './store/seed.js';
import { App } from './router.jsx';

const root = createRoot(document.getElementById('root'));

root.render(<p className="app-boot">Opening your recipes…</p>);

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
