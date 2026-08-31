import sys
import re

with open('components/dashboard/DetailedProfileForm.tsx', 'r') as f:
    content = f.read()

target = """                          <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Level / Rank</label>
                              <input name="level" value={formData.level} onChange={handleTextChange} placeholder="100L" className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                          </div>
                      </div>
                  </>"""

replacement = """                          <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Level / Rank</label>
                              <input name="level" value={formData.level} onChange={handleTextChange} placeholder="100L" className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                          </div>
                      </div>
                      
                      <div className="pt-6">
                          <StudentIdUpload />
                      </div>
                  </>"""

if target in content:
    content = content.replace(target, replacement)
    with open('components/dashboard/DetailedProfileForm.tsx', 'w') as f:
        f.write(content)
    print("Successfully replaced.")
else:
    print("Target not found.")

