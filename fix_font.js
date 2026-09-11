const fs = require('fs');
let file = fs.readFileSync('tailwind.config.ts', 'utf8');
file = file.replace("sans: ['var(--font-outfit)', 'ui-sans-serif', 'system-ui', 'sans-serif'],", "sans: ['NairaFallback', 'var(--font-outfit)', 'ui-sans-serif', 'system-ui', 'sans-serif'],");
fs.writeFileSync('tailwind.config.ts', file, 'utf8');
