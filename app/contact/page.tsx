import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ContactForm } from '@/components/contact/ContactForm';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/90 text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight sm:text-3xl sm:text-2xl sm:text-3xl text-gray-900 dark:text-white mb-4">
            Get in <span className="text-[#16a34a] dark:text-[#BEF264]">Touch</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions about finding a hostel in Ogbomoso or need support with your booking? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-8">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">
              Reach out to us directly through any of the channels below. We aim to respond to all inquiries within 2 hours during business days.
            </p>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#16a34a] dark:text-[#BEF264]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold mb-1">Our Office</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hostel Pulse Hub,<br />
                    Opposite LAUTECH Main Gate,<br />
                    Ogbomoso, Oyo State, Nigeria.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#16a34a] dark:text-[#BEF264]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold mb-1">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Support: info@hostelpulse.app<br />
                    Admin: juliusayolyn@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#16a34a] dark:text-[#BEF264]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold mb-1">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    +234 (0) 800 HOSTEL<br />
                    Mon-Fri, 9am - 5pm WAT
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-5 lg:p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}


