const fs = require('fs');

function patchPage(file, isLandlord = false) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    const varName = isLandlord ? 'landlordAccount' : 'agentAccount';
    
    // Patch the Add Property button logic
    content = content.replace(
        /onClick=\{\(\) => setIsAddModalOpen\(true\)\}/g,
        `onClick={() => {
                                                if (!${varName}?.is_approved) {
                                                    toast.error('You must verify your account completely to add properties.');
                                                    return;
                                                }
                                                setIsAddModalOpen(true);
                                            }}`
    );
    
    fs.writeFileSync(file, content, 'utf-8');
}

patchPage('app/dashboard/agent/page.tsx', false);
patchPage('app/dashboard/landlord/page.tsx', true);

console.log("Patched permissions in dashboard pages");
