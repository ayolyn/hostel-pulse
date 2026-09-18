'use client';

import { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem('hasSeenNewsletterPopup');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 8000); // Show after 8 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenNewsletterPopup', 'true');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        
        toast.success("Thanks for subscribing to LAUTECH Updates!");
        setIsOpen(false);
        localStorage.setItem('hasSeenNewsletterPopup', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-500">
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-neutral-800 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="w-16 h-16 bg-[#BEF264]/20 text-[#BEF264] rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Mail className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-black text-center text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                    Join HostelPulse Newsletter
                </h3>
                <p className="text-center text-gray-500 dark:text-neutral-400 text-sm font-medium mb-8">
                    Get exclusive LAUTECH housing updates, roommate matching alerts, and campus news directly to your inbox.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your student email" 
                        required
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-bold text-gray-900 dark:text-white transition-all text-sm"
                    />
                    <button 
                        type="submit"
                        className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-[#BEF264]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
                    >
                        Subscribe Now
                    </button>
                </form>
                
                <p className="text-[10px] text-center text-gray-400 mt-6 uppercase font-bold tracking-widest">
                    No spam. Unsubscribe anytime.
                </p>
            </div>
        </div>
    );
}
