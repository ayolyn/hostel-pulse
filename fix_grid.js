const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');

const target = `<div className="col-span-2 md:col-span-1 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">`;
const replacement = `<div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">`;
content = content.replace(target, replacement);

fs.writeFileSync('app/dashboard/student/page.tsx', content, 'utf8');
console.log("Fixed grid");
