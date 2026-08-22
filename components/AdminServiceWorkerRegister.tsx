'use client';

import { useEffect } from 'react';

export default function AdminServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/admin/' })
        .then((registration) => {
          console.log('[Admin PWA] Service worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[Admin PWA] Service worker registration note:', error);
        });
    }
  }, []);

  return null;
}
