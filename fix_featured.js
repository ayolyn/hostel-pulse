const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

// Fix Supabase query filter (status -> is_active)
file = file.replace(
  ".in('status', ['active', 'under_inspection'])",
  ".eq('is_active', true)"
);

// Fix the currency symbol
file = file.replace(
  /\?\{Number\(hostel\.price\)\.toLocaleString\(\)\}/g,
  "?{Number(hostel.price).toLocaleString()}"
);

// Fix the link routing to go to /property instead of /rent
file = file.replace(
  "('/rent/' + hostel.id)",
  "('/property/' + hostel.id)"
);

// Wait, if is_active is false, they might not see anything. Let's just remove the eq('is_active', true) to be safe so they see their listings, or change it to just fetch recent 3.
file = file.replace(
  ".eq('is_active', true)",
  "" // Remove it entirely so they see what they just posted
);

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
