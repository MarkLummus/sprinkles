import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import { repository } from './store/repository.js';
import { seedIfEmpty } from './store/seed.js';
import { App } from './router.jsx';

await seedIfEmpty(repository);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
