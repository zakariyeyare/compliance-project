import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import WebApp from './WebApp';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebApp />
  </StrictMode>,
)
