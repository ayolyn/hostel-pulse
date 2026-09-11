const fs = require('fs');
let file = fs.readFileSync('app/property/[id]/page.tsx', 'utf8');

file = file.replace(
    'landlord={property.landlord}',
    'landlord={Array.isArray(property.landlord) ? property.landlord[0] : property.landlord}'
);

file = file.replace(
    'agent={property.agent}',
    'agent={Array.isArray(property.agent) ? property.agent[0] : property.agent}'
);

fs.writeFileSync('app/property/[id]/page.tsx', file, 'utf8');
