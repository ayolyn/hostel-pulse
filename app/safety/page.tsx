export const runtime = 'edge';
import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function Safety() {
  return (
    <div className="min-h-screen bg-white dark:bg-black/90 text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <svg className="w-10 h-10 text-[#16a34a] dark:text-[#BEF264]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight sm:text-3xl sm:text-2xl sm:text-3xl text-gray-900 dark:text-white mb-4">
            Trust & <span className="text-[#16a34a] dark:text-[#BEF264]">Safety</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Your security is our top priority. Learn how we protect you from accommodation fraud in Ogbomoso.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#16a34a] dark:text-[#BEF264]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Hostel Pulse Escrow System</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Never pay directly to an agent's personal bank account again. When you book a hostel on our platform, your money is held safely in the Hostel Pulse Escrow Account. The funds are only released to the landlord or agent AFTER you have moved in and verified that the hostel matches the description on our app. If there is a dispute, you get a full refund.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#16a34a] dark:text-[#BEF264]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Verified Landlords and Agents</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Every agent and landlord on Hostel Pulse undergoes a rigorous KYC (Know Your Customer) verification process. We require government-issued IDs, NIN validation, and physical verification of their offices in Ogbomoso. We maintain a zero-tolerance policy for fraudulent behavior.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#16a34a] dark:text-[#BEF264]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Physical Inspections</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                While we provide high-quality photos and sometimes virtual tours, we strongly encourage physical inspections before confirming your move-in status. Always inspect properties during daylight hours and preferably go with a friend or use our trusted inspection guides available near campus.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Red Flags to Watch Out For
          </h3>
          <ul className="list-disc pl-5 space-y-3 text-gray-600 dark:text-gray-400">
            <li>Agents requesting "inspection fees" upfront before showing you the property. (Hostel Pulse does not charge inspection fees).</li>
            <li>Prices that seem too good to be true for areas like UnderG or Adenike.</li>
            <li>Pressure to bypass the Hostel Pulse platform and pay them directly via bank transfer.</li>
            <li>Landlords or agents who refuse physical inspections.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


