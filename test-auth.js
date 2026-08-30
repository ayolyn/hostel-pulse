require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuth() {
    console.log("Attempting sign in...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@hostelio.com',
        password: 'password123'
    });

    if (error) {
        console.error("Sign In Error:", error.message);
    } else {
        console.log("Sign In Success:", !!data.session);
    }
}

testAuth();
