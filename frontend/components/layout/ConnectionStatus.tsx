'use client';

import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-1.5" title={connected ? 'Real-time connected' : 'Offline'}>
      {connected ? (
        <Wifi size={14} className="text-green-500" />
      ) : (
        <WifiOff size={14} className="text-gray-400" />
      )}
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
    </div>
  );
}
