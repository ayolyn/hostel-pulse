const fs = require('fs');
let content = fs.readFileSync('app/dashboard/agent/page.tsx', 'utf-8');

// The agent page does not have a setRefreshCount. We can just use window.location.reload() inside onUpdate, or we can use router.refresh().
content = content.replace(/<DetailedProfileForm account=\{account\} userId=\{userId\} \/>/, '<DetailedProfileForm account={account} userId={userId} onUpdate={() => window.location.reload()} />');

fs.writeFileSync('app/dashboard/agent/page.tsx', content, 'utf-8');

let content2 = fs.readFileSync('app/dashboard/landlord/page.tsx', 'utf-8');
content2 = content2.replace(/<DetailedProfileForm account=\{account\} userId=\{userId as string\} \/>/, '<DetailedProfileForm account={account} userId={userId as string} onUpdate={() => window.location.reload()} />');
fs.writeFileSync('app/dashboard/landlord/page.tsx', content2, 'utf-8');

console.log("Patched page.tsx onUpdate");
