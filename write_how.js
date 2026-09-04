const fs = require('fs');

const content = `import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/90 text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            How <span className="text-emerald-500">Hostel Pulse</span> Works
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            The LAUTECH ecosystem for housing, gigs, and campus marketplace. No scams, no insane agent fees, just verified value.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Find Your Need</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Whether you need a self-con in Under-G, a fairly used mattress in Adenike, or a runner to pick up your laundry, just search. We only list verified properties and vetted service providers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Pay Into Escrow</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Never get scammed again. When you pay for rent or an item, your money goes into the Hostel Pulse Escrow (via Paystack/Flutterwave). The agent or seller doesn't get a kobo until you confirm you got exactly what you paid for.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Confirm & Move In</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Go inspect the hostel. Check the gas cylinder. Once you click "I am satisfied" on the app, we release the funds. If it's a scam, you get an instant refund. It is that simple.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('app/how-it-works/page.tsx', content, 'utf8');
