import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tharika Admin Portal',
    short_name: 'Admin',
    description: 'Tharika Decors & Events Studio Management Portal',
    start_url: '/admin',
    scope: '/admin/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#0F172A',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
