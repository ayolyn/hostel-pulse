const fs = require('fs');
let content = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

// Replace the hardcoded array with a prop acceptance
content = content.replace(
    'export function FeaturedListings() {',
    `export function FeaturedListings({ properties = [] }: { properties?: any[] }) {
  const displayProperties = properties.length > 0 ? properties.map(p => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: "\\u20A6" + p.price.toLocaleString(),
    image: p.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    beds: p.bedrooms || 1,
    baths: p.bathrooms || 1,
    isVerified: p.verification_status === 'Verified'
  })) : featuredHostels;`
);

// We need to use `displayProperties.map` instead of `featuredHostels.map`
content = content.replace(
    'featuredHostels.map((hostel, i)',
    'displayProperties.map((hostel, i)'
);

// Fix the link to go to dynamic property detail
content = content.replace(
    '<Link href="/rent" className="block w-full py-3 text-center bg-gray-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-gray-900 dark:text-white rounded-xl font-bold transition-colors">',
    '<Link href={`/property/${hostel.id}`} className="block w-full py-3 text-center bg-gray-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-gray-900 dark:text-white rounded-xl font-bold transition-colors">'
);

fs.writeFileSync('components/home/FeaturedListings.tsx', content, 'utf8');
console.log('Updated FeaturedListings.tsx to accept props');
