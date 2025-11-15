import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/theme.css';
import WebApp from './WebApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebApp />
  </StrictMode>,
)
