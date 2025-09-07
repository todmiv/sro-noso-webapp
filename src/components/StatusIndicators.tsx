import React, { useState, useEffect } from 'react';

interface StatusIndicatorProps {
  mode: 'local' | 'prod';
  backendStatus: 'online' | 'offline' | 'checking';
  websiteStatus: 'online' | 'offline' | 'checking';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ mode, backendStatus, websiteStatus }) => {
  const getModeText = (): string => {
    return mode === 'local' ? 'Локальный' : 'Продакшен';
  };

  const getModeColor = (): string => {
    return mode === 'local' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'online':
        return (
          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'checking':
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
        );
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'online': return 'Онлайн';
      case 'offline': return 'Оффлайн';
      case 'checking': return 'Проверка...';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="mb-6 space-y-2">
      <div className="text-xs text-gray-600">Статус системы:</div>
      <div className="flex flex-col space-y-2">
        <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${getModeColor()}`}>
          <svg className="w-4 h-4 text-current mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Режим: {getModeText()}
        </div>

        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
          {getStatusIcon(backendStatus)}
          Backend: {getStatusText(backendStatus)}
        </div>

        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
          {getStatusIcon(websiteStatus)}
          Сайт СРО: {getStatusText(websiteStatus)}
        </div>
      </div>
    </div>
  );
};

export const useStatusIndicators = () => {
  const [mode, setMode] = useState<'local' | 'prod'>('prod');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [websiteStatus, setWebsiteStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const checkBackendStatus = async (): Promise<void> => {
    setBackendStatus('checking');
    try {
      // Use Supabase function URLs for proper status checking
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');

      if (isLocalhost) {
        // Local Supabase check
        const backendUrl = 'http://127.0.0.1:54321/functions/v1/reestr-parser';

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inn: 'test123' }), // Test request
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        setBackendStatus(response.status >= 400 ? 'offline' : 'online');
      } else {
        // Production Supabase check - use actual project URL
        const backendUrl = 'https://xibewgvrooyvbragtwxm.supabase.co/functions/v1/reestr-parser';

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
          },
          body: JSON.stringify({ inn: 'test123' }), // Test request
          signal: AbortSignal.timeout(15000) // 15 second timeout for production
        });

        setBackendStatus(response.status >= 400 ? 'offline' : 'online');
      }
    } catch (error) {
      console.error('Backend status check failed:', error);
      setBackendStatus('offline');
    }
  };

  const checkWebsiteStatus = async (): Promise<void> => {
    setWebsiteStatus('checking');
    try {
      // Try to fetch with credentials to bypass some CORS issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      let response;
      try {
        response = await fetch('https://sronoso.ru', {
          method: 'GET',
          mode: 'no-cors', // Try no-cors mode to avoid CORS issues
          cache: 'no-cache',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        // With no-cors, we can't access response properties
        if (response) {
          setWebsiteStatus('online');
          return;
        }
      } catch (corsError) {
        clearTimeout(timeoutId);
      }

      // If that fails, try a different approach - check if the domain resolves
      const img = new Image();
      const imgTimeout = setTimeout(() => {
        setWebsiteStatus('offline');
      }, 5000);

      img.onload = () => {
        clearTimeout(imgTimeout);
        setWebsiteStatus('online');
      };

      img.onerror = () => {
        clearTimeout(imgTimeout);
        // For localhost development, CORS is expected - show as unknown status
        setWebsiteStatus('offline');
      };

      img.src = `https://sronoso.ru/favicon.ico?t=${Date.now()}`;

    } catch (error) {
      console.error('Website status check failed:', error);
      setWebsiteStatus('offline');
    }
  };

  useEffect(() => {
    // Determine current mode
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    setMode(isLocalhost ? 'local' : 'prod');

    // Initial checks
    checkBackendStatus();
    checkWebsiteStatus();

    // Periodic checks every 30 seconds
    const interval = setInterval(() => {
      checkBackendStatus();
      checkWebsiteStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    mode,
    backendStatus,
    websiteStatus
  };
};

export default StatusIndicator;
