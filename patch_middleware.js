const fs = require('fs');
let content = fs.readFileSync('middleware.ts', 'utf-8');

const securityHeaders = `
    // Add Security Headers
    supabaseResponse.headers.set('X-DNS-Prefetch-Control', 'on');
    supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
    supabaseResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
    supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
    supabaseResponse.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    
    // Content Security Policy
    const csp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https:;";
    supabaseResponse.headers.set('Content-Security-Policy', csp);

    return supabaseResponse;
`;

content = content.replace("    return supabaseResponse;", securityHeaders);

fs.writeFileSync('middleware.ts', content, 'utf-8');
console.log("Patched middleware.ts");
