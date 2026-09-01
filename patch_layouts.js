const fs = require('fs');

function patchLayout(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Check if we already patched this
    if (content.includes('skip_compliance')) return;

    content = content.replace(
        /const isApproved = account\?\.is_approved \?\? false;/g,
        `const isApproved = account?.is_approved ?? false;\n    const skippedCompliance = cookieStore.get('skip_compliance')?.value === 'true';`
    );

    content = content.replace(
        /\{!hasSubmittedCompliance \? \(/g,
        `{(!hasSubmittedCompliance && !skippedCompliance) ? (`
    );

    fs.writeFileSync(file, content, 'utf-8');
}

patchLayout('app/dashboard/agent/layout.tsx');
patchLayout('app/dashboard/landlord/layout.tsx');

console.log("Patched layouts to support skip_compliance cookie");
