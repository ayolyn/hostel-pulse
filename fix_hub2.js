const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

content = content.replace(
    "const [newPassword, setNewPassword] = useState('');\n    const [passwordMsg, setPasswordMsg] = useState('');",
    "const [currentPassword, setCurrentPassword] = useState('');\n    const [newPassword, setNewPassword] = useState('');\n    const [confirmPassword, setConfirmPassword] = useState('');\n    const [passwordMsg, setPasswordMsg] = useState('');\n    const [is2FAEnabled, setIs2FAEnabled] = useState(false);"
);

content = content.replace(
    "const handlePasswordChange = async (e: React.FormEvent) => {\n        e.preventDefault();\n        if (newPassword.length < 6) {\n            setPasswordMsg('Password must be at least 6 characters');\n            return;\n        }\n        \n        const { error } = await supabase.auth.updateUser({ password: newPassword });\n        if (error) {\n            setPasswordMsg(error.message);\n        } else {\n            setPasswordMsg('Password updated successfully');\n            setNewPassword('');\n        }\n    };",
    `const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setPasswordMsg('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg('New passwords do not match');
            return;
        }
        
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordMsg(error.message);
        } else {
            setPasswordMsg('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };`
);

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
