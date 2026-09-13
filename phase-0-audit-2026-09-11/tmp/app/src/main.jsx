import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/app.css';
import { repository } from './store/repository.js';
import { seedIfEmpty } from './store/seed.js';
import { App } from './router.jsx';

try {
  await seedIfEmpty(repository);
} catch (err) {
  document.getElementById('root').textContent = 'Could not open the local store. Try reloading.';
  throw err;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
