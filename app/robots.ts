import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/'],
    },
    sitemap: 'https://hostelpulse.app/sitemap.xml',
  };
}
