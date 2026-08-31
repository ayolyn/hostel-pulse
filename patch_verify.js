const fs = require('fs');
let content = fs.readFileSync('app/auth/page.tsx', 'utf-8');

content = content.replace("setSuccessMsg(\"Account created! Please check your email to confirm, then sign in.\");\n                    setMode('signin');", "setSuccessMsg(\"Account created! We've sent a 6-digit confirmation code to your email.\");\n                    setMode('verify');");

const verifyBlock = `        if (mode === 'verify') {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup'
            });

            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
                return;
            }
            
            router.push('/dashboard');
            return;
        }

        if (mode === 'signup') {`;

content = content.replace("if (mode === 'signup') {", verifyBlock);

fs.writeFileSync('app/auth/page.tsx', content, 'utf-8');
console.log("Updated app/auth/page.tsx");
