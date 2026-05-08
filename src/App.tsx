import { AppRoutes } from './routes/AppRoutes';
import { ChatbotWidget } from './components/ChatbotWidget';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';

export default function App() {
  return (
    <>
      <AppRoutes />
      <ChatbotWidget />
      <PWAInstallBanner />
      <PWAUpdateNotification />
    </>
  );
}
