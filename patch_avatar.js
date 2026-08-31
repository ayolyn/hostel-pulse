const fs = require('fs');
let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

const uploadFunction = `
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
                setMsg({ type: 'error', text: 'Image must be less than 5MB' });
                return;
            }

            setUploadingAvatar(true);
            setMsg({ type: '', text: '' });

            const fileExt = file.name.split('.').pop();
            const fileName = \`\${userId}-\${Math.random()}.\${fileExt}\`;
            const filePath = \`avatars/\${fileName}\`;

            const { error: uploadError } = await supabase.storage
                .from('market-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('market-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            
            // Also save immediately to db
            const table = userRole === 'student' ? 'student_accounts' : (userRole === 'landlord' ? 'landlord_accounts' : 'agent_profiles');
            await supabase.from(table).update({ avatar_url: publicUrl }).eq('id', userId);
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
            
            if(onUpdate) onUpdate();
            setMsg({ type: 'success', text: 'Profile photo updated!' });
        } catch (error: any) {
            setMsg({ type: 'error', text: error.message });
        } finally {
            setUploadingAvatar(false);
        }
    };
`;

if (!content.includes('handleAvatarUpload')) {
    content = content.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n" + uploadFunction);
}

const targetUI = `<div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 shadow-inner group relative">
                    {(formData.avatar_url || formData.logo_url) ? (
                        <Image src={formData.avatar_url || formData.logo_url} alt="Profile" width={96} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    ) : (
                        <Image src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${encodeURIComponent(formData.contact_name || 'User')}&backgroundColor=e5e5e5\`} alt="Profile Fallback" width={96} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    )}
                </div>`;

const replacementUI = `<label className="w-24 h-24 rounded-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 shadow-inner group relative cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    {(formData.avatar_url || formData.logo_url) ? (
                        <Image src={formData.avatar_url || formData.logo_url} alt="Profile" width={96} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    ) : (
                        <Image src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${encodeURIComponent(formData.contact_name || 'User')}&backgroundColor=e5e5e5\`} alt="Profile Fallback" width={96} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                        {uploadingAvatar ? <span className="text-white text-[10px] font-black uppercase">Wait...</span> : <UploadCloud className="w-6 h-6 text-white" />}
                    </div>
                </label>`;

content = content.replace(targetUI, replacementUI);

fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', content, 'utf-8');
console.log("DetailedProfileForm updated with avatar upload");
