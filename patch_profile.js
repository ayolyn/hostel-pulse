const fs = require('fs');
let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

const regex = /<input name="level" value=\{formData.level\}.*?\/>\s*<\/div>\s*<\/div>\s*<\/>/g;

content = content.replace(regex, (match) => {
    return match.replace('</>', '\n                      <div className="pt-6">\n                          <StudentIdUpload />\n                      </div>\n                  </>');
});

fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', content, 'utf-8');
console.log("DetailedProfileForm updated");
