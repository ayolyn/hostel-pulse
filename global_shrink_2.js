const fs = require('fs');
const path = require('path');

function walk(dir, ext) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file, ext));
        } else { 
            if (file.endsWith(ext)) results.push(file);
        }
    });
    return results;
}

const files = [...walk('app', '.tsx'), ...walk('components', '.tsx')];

let count = 0;

for (let file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;
    
    // Aggressive Shrink Round 2
    content = content.replace(/text-7xl/g, 'text-4xl sm:text-5xl');
    content = content.replace(/text-6xl/g, 'text-3xl sm:text-4xl');
    content = content.replace(/p-16/g, 'p-8');
    content = content.replace(/p-12/g, 'p-6');
    content = content.replace(/py-12/g, 'py-6');
    content = content.replace(/px-12/g, 'px-6');
    
    // specifically checking form elements padding
    content = content.replace(/py-5/g, 'py-3');
    content = content.replace(/py-4/g, 'py-3');
    content = content.replace(/px-8/g, 'px-4');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        count++;
    }
}

console.log(`Shrunk elements in ${count} files globally`);
