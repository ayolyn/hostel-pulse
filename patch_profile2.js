const fs = require('fs');
let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

const target = `<input type="date" name="dob" value={formData.dob} onChange={handleTextChange} className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                          </div>
                      </div>
                  </>`;

const replacement = `<input type="date" name="dob" value={formData.dob} onChange={handleTextChange} className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                          </div>
                      </div>
                      
                      <div className="pt-6">
                          <StudentIdUpload />
                      </div>
                  </>`;

content = content.replace(target, replacement);

fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', content, 'utf-8');
console.log("DetailedProfileForm patched successfully");
