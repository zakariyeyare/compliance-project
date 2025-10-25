import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/index.jsx';

function WebApp() {

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default WebApp
