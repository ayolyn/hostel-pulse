'use client';

import React, { useState } from 'react';
import { submitContactForm } from '@/app/actions/contact';
import { Loader2 } from 'lucide-react';

export function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        const formData = new FormData(e.currentTarget);
        const result = await submitContactForm(formData);

        if (result?.error) {
            setStatus('error');
            setMessage(result.error);
        } else {
            setStatus('success');
            setMessage('Your message has been sent successfully. We will get back to you shortly.');
            (e.target as HTMLFormElement).reset();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm font-medium">
                    {message}
                </div>
            )}
            
            {status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
                    {message}
                </div>
            )}

            <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input 
                type="text" 
                id="name" 
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#16a34a] dark:focus:ring-[#BEF264] focus:border-transparent transition-colors outline-none"
                placeholder="John Doe"
            />
            </div>
            <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input 
                type="email" 
                id="email" 
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#16a34a] dark:focus:ring-[#BEF264] focus:border-transparent transition-colors outline-none"
                placeholder="john@example.com"
            />
            </div>
            <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
            <select 
                id="subject" 
                name="subject"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#16a34a] dark:focus:ring-[#BEF264] focus:border-transparent transition-colors outline-none"
            >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Issue with a Booking">Issue with a Booking</option>
                <option value="Report an Agent">Report an Agent</option>
                <option value="Partnership">Partnership</option>
            </select>
            </div>
            <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
            <textarea 
                id="message" 
                name="message"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#16a34a] dark:focus:ring-[#BEF264] focus:border-transparent transition-colors outline-none resize-none"
                placeholder="How can we help you?"
            ></textarea>
            </div>
            <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center gap-2 bg-[#16a34a] hover:bg-green-700 dark:bg-[#BEF264] dark:hover:bg-[#a8e04b] text-white dark:text-gray-900 font-bold py-4 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
            </button>
        </form>
    );
}
