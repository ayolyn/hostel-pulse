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
    
    // Aggressive Shrink
    content = content.replace(/text-5xl/g, 'text-3xl sm:text-4xl');
    content = content.replace(/text-4xl/g, 'text-2xl sm:text-3xl');
    // For text-3xl, only if it's not already sm:text-3xl or md:text-3xl
    content = content.replace(/(?<!sm:|md:|lg:|xl:)text-3xl/g, 'text-xl sm:text-2xl');
    
    content = content.replace(/p-10/g, 'p-6');
    content = content.replace(/p-8/g, 'p-5');
    content = content.replace(/rounded-\[3rem\]/g, 'rounded-3xl');
    
    // Some buttons are px-12 py-5, make them px-8 py-4
    content = content.replace(/px-12 py-5/g, 'px-8 py-4');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        count++;
    }
}

console.log(`Shrunk elements in ${count} files globally`);
