import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-950/90 border border-amber-600/70 px-4 py-2.5 text-xs font-mono-code text-amber-200 shadow-2xl backdrop-blur-md animate-bounce"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <p className="font-bold">Offline Mode Active</p>
        <p className="text-[11px] text-amber-300/80 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Local Heuristic Link Guard is still operational.
        </p>
      </div>
    </div>
  );
};
