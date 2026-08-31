const fs = require('fs');
let content = fs.readFileSync('app/auth/page.tsx', 'utf-8');

const target = `className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-14 pr-12 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        {mode === 'signin' && (
                            <button 
                                onClick={handleForgotPassword}
                                type="button" 
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-[#BEF264] hover:underline"
                            >`;

const replacement = `className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-14 pr-24 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        {mode === 'signin' && (
                            <button 
                                onClick={handleForgotPassword}
                                type="button" 
                                className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-[#BEF264] hover:underline"
                            >`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('app/auth/page.tsx', content, 'utf-8');
    console.log("Fixed overlapping buttons in app/auth/page.tsx");
} else {
    console.log("Target not found");
}
