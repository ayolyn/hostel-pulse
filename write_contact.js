const fs = require('fs');

const content = `import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Having issues with an escrow payment? Need to verify an agent in Ogbomoso? We are here to help 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-emerald-500 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Office Location</h3>
                  <p className="text-gray-500 dark:text-gray-400">Under-G Road, LAUTECH<br />Ogbomoso, Oyo State</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-emerald-500 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email Us</h3>
                  <p className="text-gray-500 dark:text-gray-400">support@hostelpulse.app</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-emerald-500 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Call/WhatsApp</h3>
                  <p className="text-gray-500 dark:text-gray-400">+234 (0) 900 000 0000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email or Phone</label>
                <input type="text" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" placeholder="john@student.lautech.edu.ng" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea rows={4} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" placeholder="I have an issue with my hostel booking..."></textarea>
              </div>
              <button type="button" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('app/contact/page.tsx', content, 'utf8');
