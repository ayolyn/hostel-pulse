const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) {
            fileList = walk(path.join(dir, file), fileList);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                fileList.push(path.join(dir, file));
            }
        }
    }
    return fileList;
}

const allFiles = [...walk('app/dashboard'), ...walk('components/dashboard'), ...walk('components/ui'), ...walk('components/layout')];

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    content = content.replace(/rounded-\[3rem\]/g, 'rounded-3xl');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl');
    content = content.replace(/rounded-\[2rem\]/g, 'rounded-2xl');
    content = content.replace(/p-10/g, 'p-6');
    content = content.replace(/p-8/g, 'p-5');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        console.log("Global shrink patched", file);
    }
});
