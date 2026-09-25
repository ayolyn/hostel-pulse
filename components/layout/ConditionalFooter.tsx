'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();
    
    // Hide footer on all portal/dashboard routes
    const isPortal = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/messages') || 
                     pathname?.startsWith('/wallet') || 
                     pathname?.startsWith('/profile') || 
                     pathname?.startsWith('/book') ||
                     pathname?.startsWith('/hq_admin') ||
                     pathname?.startsWith('/admin');
    
    if (isPortal) return null;
    
    return <Footer />;
}
