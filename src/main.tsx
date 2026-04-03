import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { CountryProvider } from './context/CountryContext.tsx';
import './index.css';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <CountryProvider>
          <App />
        </CountryProvider>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
);
