const fs = require('fs');
let content = fs.readFileSync('components/dashboard/RoommatesTab.tsx', 'utf8');

// Shrink main container spacing
content = content.replace('className="space-y-8"', 'className="space-y-4"');
content = content.replace('text-2xl font-black', 'text-xl font-black');
content = content.replace('w-6 h-6 text-[#BEF264]', 'w-4 h-4 text-[#BEF264]');
content = content.replace('text-sm mt-1', 'text-[11px] mt-1');

// Shrink "Your Active Profile" box
content = content.replace('rounded-3xl p-6', 'rounded-2xl p-4');
content = content.replace('mb-8">\\n                        <PulseMapbox snapMode={true}', 'mb-4">\\n                        <PulseMapbox snapMode={true}');

// Shrink Search input
content = content.replace('py-4 text-base', 'py-2.5 text-sm');

// Shrink the headers for sections
content = content.replace('text-2xl font-black text-gray-900', 'text-lg font-black text-gray-900');

fs.writeFileSync('components/dashboard/RoommatesTab.tsx', content, 'utf8');
