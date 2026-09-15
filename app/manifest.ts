import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HostelPulse',
    short_name: 'HostelPulse',
    description: 'Premium Student Housing in Ogbomoso',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#BEF264',
    icons: [
      {
        src: '/logo-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
