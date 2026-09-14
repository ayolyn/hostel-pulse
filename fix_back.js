const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');

const regex = /<div className="flex items-center gap-4">\s*<Link href="\/dashboard\/student"[\s\S]*?<\/Link>\s*<h1[\s\S]*?<\/h1>\s*<\/div>/g;

const replacement = `<div className="mb-4">
                        <button onClick={() => router.push('/dashboard/student')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest text-xs font-black">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('app/dashboard/student/page.tsx', content, 'utf8');
console.log("Fixed back buttons");
