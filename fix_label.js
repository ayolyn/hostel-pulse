const fs = require('fs');

const file = 'app/dashboard/student/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// The block ends with:
//                                 <input 
//                                     type="file" 
//                                     onChange={handleAvatarUpload} 
//                                     accept="image/*" 
//                                     className="hidden" 
//                                 />
//                             </div>
// We need to replace the last `</div>` with `</label>`

content = content.replace(`                                <input \n                                    type="file" \n                                    onChange={handleAvatarUpload} \n                                    accept="image/*" \n                                    className="hidden" \n                                />\n                            </div>`, `                                <input \n                                    type="file" \n                                    onChange={handleAvatarUpload} \n                                    accept="image/*" \n                                    className="hidden" \n                                />\n                            </label>`);

fs.writeFileSync(file, content, 'utf-8');
console.log("Fixed label syntax error");
