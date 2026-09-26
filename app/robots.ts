import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const aiAndSearchBots = [
    'Googlebot',
    'Bingbot',
    'Applebot',
    'Applebot-Extended',
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Google-Extended',
    'GoogleOther',
    'DeepSeekBot',
    'Meta-ExternalAgent',
    'Meta-ExternalFetcher',
    'facebookexternalhit',
    'WhatsApp',
    'magpie-crawler',
    'cohere-ai',
    'CCBot',
    'FacebookBot',
    'Bytespider',
    'OmgiliBot',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/onboarding/', '/auth/'],
      },
      ...aiAndSearchBots.map(bot => ({
        userAgent: bot,
        allow: '/',
      })),
    ],
    sitemap: 'https://hostelpulse.app/sitemap.xml',
  };
}
