const fs = require('fs');

function reduceFont(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Huge hero font
    content = content.replace(/text-4xl leading-\[1.1\] sm:text-5xl md:text-6xl lg:text-7xl/g, 'text-2xl leading-tight md:text-4xl lg:text-5xl');
    
    // Subheadlines
    content = content.replace(/text-lg md:text-xl/g, 'text-sm md:text-base');
    
    // Headings like text-3xl
    content = content.replace(/text-3xl md:text-5xl lg:text-6xl/g, 'text-xl md:text-3xl lg:text-4xl');
    content = content.replace(/text-4xl md:text-6xl/g, 'text-2xl md:text-4xl');
    content = content.replace(/text-3xl/g, 'text-xl md:text-2xl');
    
    // Any text-2xl to text-lg
    content = content.replace(/text-2xl/g, 'text-lg md:text-xl');
    
    // Paragraphs and small text
    content = content.replace(/text-lg/g, 'text-sm md:text-base');
    content = content.replace(/text-base/g, 'text-xs md:text-sm');
    
    fs.writeFileSync(file, content, 'utf8');
}

reduceFont('app/LandingPageClient.tsx');
reduceFont('components/home/FeaturedListings.tsx');
reduceFont('components/home/WhyHostelPulse.tsx');
reduceFont('components/home/FAQSection.tsx');

console.log('Massively reduced font sizes across all home components');
