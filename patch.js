const fs = require('fs');

const filePath = 'components/dashboard/ListingStudio.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add video_url to form state
content = content.replace(/is_newly_built: false,/g, "is_newly_built: false,\n          video_url: '',");
content = content.replace("is_newly_built: data.is_newly_built || false,", "is_newly_built: data.is_newly_built || false,\n                      video_url: data.video_url || '',");

// Add uploadingVideo state
content = content.replace("const [uploadingImages, setUploadingImages] = useState(false);", "const [uploadingImages, setUploadingImages] = useState(false);\n    const [uploadingVideo, setUploadingVideo] = useState(false);");

// Add handleVideoUpload
const videoUploadCode = `
    const handleVideoUpload = async (file: File) => {
        if (!file) return;
        if (file.size > 25 * 1024 * 1024) {
            toast.error('Video must be less than 25MB');
            return;
        }
        setUploadingVideo(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUploadingVideo(false); return; }

        const ext = file.name.split('.').pop();
        const path = \`properties/videos/\${user.id}/\${Date.now()}_\${Math.random().toString(36).slice(2)}.\${ext}\`;
        const { data, error } = await supabase.storage
            .from('market-images') // reuse existing public bucket
            .upload(path, file, { upsert: false, cacheControl: '3600' });

        if (!error && data) {
            const { data: urlData } = supabase.storage
                .from('market-images')
                .getPublicUrl(data.path);
            setForm(prev => ({ ...prev, video_url: urlData.publicUrl }));
            toast.success('Video uploaded successfully!');
        } else {
            console.error('Video upload error:', error?.message);
            toast.error('Failed to upload video');
        }
        setUploadingVideo(false);
    };
`;
content = content.replace("const removeImage = (url: string) => {", videoUploadCode + "\n    const removeImage = (url: string) => {");

// Add video_url to payload
content = content.replace("youtube_video_url: form.youtube_video_url,", "video_url: form.video_url,\n              youtube_video_url: form.youtube_video_url,");

// Add Video Upload UI
const uiCode = `
                    {/* Raw Video Upload */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Raw Video Walkthrough (Max 25MB)</label>
                        <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-8 bg-gray-50/50 dark:bg-neutral-900/50 text-center relative group">
                            <input 
                                type="file" 
                                accept="video/*"
                                onChange={e => e.target.files && handleVideoUpload(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {uploadingVideo ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-[#BEF264] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Uploading Video...</p>
                                </div>
                            ) : form.video_url ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-[#BEF264]/20 text-[#BEF264] rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-black uppercase text-gray-900 dark:text-white">Video Uploaded</p>
                                    <p className="text-[10px] font-bold text-gray-400">Click to change video</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#BEF264] transition-colors" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Click to upload video (.mp4, .mov)</p>
                                </div>
                            )}
                        </div>
                    </div>
`;
content = content.replace("                        <label className=\"text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2\">Media Links</label>", uiCode + "\n                        <label className=\"text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2\">External Media Links</label>");

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patch applied to ListingStudio.tsx");
