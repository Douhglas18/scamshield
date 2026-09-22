import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Verify connection reliably without false positives in iframe environments
    const checkConnection = async () => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
        return;
      }
      // If navigator reports offline, verify with a lightweight ping to /api/health
      try {
        const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      checkConnection();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
