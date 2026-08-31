const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ListingStudio.tsx', 'utf-8');

const target = `<label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Media Links</label>
                    <div className="space-y-3">`;

const replacement = `<label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Media Links & Video</label>
                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/10 relative">
                            <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => { if(e.target.files?.[0]) handleVideoUpload(e.target.files[0]) }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                                {uploadingVideo ? (
                                    <div className="flex items-center gap-2 text-[#BEF264]">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Uploading...</span>
                                    </div>
                                ) : form.video_url ? (
                                    <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Video Uploaded
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-gray-400" />
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            Upload Raw Video Walkthrough (Max 25MB)
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('components/dashboard/ListingStudio.tsx', content, 'utf-8');
console.log("ListingStudio updated");
