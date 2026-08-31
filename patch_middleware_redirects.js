const fs = require('fs');
let content = fs.readFileSync('middleware.ts', 'utf-8');

const applyHeaders = `
function applySecurityHeaders(res: NextResponse) {
    res.headers.set('X-DNS-Prefetch-Control', 'on');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https:;");
    return res;
}
`;

// Insert function
if (!content.includes('function applySecurityHeaders')) {
    content = content.replace("export async function middleware(request: NextRequest) {", applyHeaders + "\nexport async function middleware(request: NextRequest) {");
}

// Replace all return NextResponse.redirect with applySecurityHeaders(NextResponse.redirect)
content = content.replace(/return NextResponse\.redirect\((.*?)\);/g, "return applySecurityHeaders(NextResponse.redirect($1));");

// Update the end of the file
content = content.replace(/\/\/ Add Security Headers[\s\S]*?return supabaseResponse;/m, "return applySecurityHeaders(supabaseResponse);");

fs.writeFileSync('middleware.ts', content, 'utf-8');
console.log("Patched middleware redirects");
