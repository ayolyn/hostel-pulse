export const runtime = 'edge';
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();

    // Base specific routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: 'https://HOSTELPULSE.com.ng',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://HOSTELPULSE.com.ng/buy',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: 'https://HOSTELPULSE.com.ng/rent',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: 'https://HOSTELPULSE.com.ng/agents',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: 'https://HOSTELPULSE.com.ng/sell',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://HOSTELPULSE.com.ng/blog',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: 'https://HOSTELPULSE.com.ng/calculator',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // Fetch dynamic properties
    const { data: properties } = await supabase.from('properties').select('id, updated_at').eq('status', 'Available');

    if (properties) {
        const propertyRoutes = properties.map((property) => ({
            url: `https://HOSTELPULSE.com.ng/property/${property.id}`,
            lastModified: property.updated_at ? new Date(property.updated_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
        routes.push(...propertyRoutes);
    }

    return routes;
}
