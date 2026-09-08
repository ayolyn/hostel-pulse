const fs = require('fs');
let file = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf8');

const oldStudentIdBlock = `
                              <label className="block w-full border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-[#BEF264] rounded-2xl p-6 text-center cursor-pointer transition-colors group">
                                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 group-hover:bg-[#BEF264]/20 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                                      <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#BEF264]" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                      {files.student_id ? files.student_id.name : formData.student_id_url ? 'ID Uploaded (Click to replace)' : 'Upload Student ID'}
                                  </span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'student_id')} />
                              </label>
`;

const newStudentIdBlock = `
                              {account?.is_approved ? (
                                  <div className="w-full border-2 border-[#BEF264] bg-[#BEF264]/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                                      <div className="w-12 h-12 bg-[#BEF264] rounded-full flex items-center justify-center mb-3">
                                          <CheckCircle className="w-6 h-6 text-black" />
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] block mb-1">
                                          ID Verified & Locked
                                      </span>
                                      <p className="text-xs text-gray-500">Contact support to change your identity documents.</p>
                                  </div>
                              ) : (
                                  <label className="block w-full border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-[#BEF264] rounded-2xl p-6 text-center cursor-pointer transition-colors group">
                                      <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 group-hover:bg-[#BEF264]/20 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                                          <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#BEF264]" />
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                          {files.student_id ? files.student_id.name : formData.student_id_url ? 'ID Uploaded (Click to replace)' : 'Upload Student ID'}
                                      </span>
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'student_id')} />
                                  </label>
                              )}
`;

// Make sure CheckCircle is imported from lucide-react if not already
if (!file.includes('CheckCircle')) {
    file = file.replace('import { UploadCloud', 'import { UploadCloud, CheckCircle');
}

file = file.replace(oldStudentIdBlock.trim(), newStudentIdBlock.trim());
fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', file, 'utf8');
