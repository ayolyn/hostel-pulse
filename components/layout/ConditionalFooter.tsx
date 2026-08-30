'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();
    
    // Hide footer on all portal/dashboard routes
    const isPortal = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/messages') || 
                     pathname?.startsWith('/wallet') || 
                     pathname?.startsWith('/profile');
    
    if (isPortal) return null;
    
    return <Footer />;
}
