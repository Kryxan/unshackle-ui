import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { SearchPage } from '@/pages/search-page';
import { QueuePage } from '@/pages/queue-page';
import { HistoryPage } from '@/pages/history-page';
import { ServicesPage } from '@/pages/services-page';
import { DownloadPage } from '@/pages/download-page';
import { SettingsPage } from '@/pages/settings-page';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { useUIStore } from '@/stores';
import { queryClient } from '@/lib/api/query-client';

function AppContent() {
  const { activeTab, theme, setTheme } = useUIStore();

  // Initialize app data
  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'download':
        return <DownloadPage />;
      case 'queue':
        return <QueuePage />;
      case 'history':
        return <HistoryPage />;
      case 'services':
        return <ServicesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DownloadPage />;
    }
  };

  return (
    <WebSocketProvider>
      <AppLayout>
        {renderActivePage()}
      </AppLayout>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
