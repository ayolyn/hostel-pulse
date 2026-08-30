import React from 'react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/90 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-4">
            How <span className="text-[#16a34a] dark:text-[#BEF264]">Hostel Pulse</span> Works
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Finding the perfect student accommodation in Ogbomoso has never been easier. We connect LAUTECH students with verified landlords securely.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-[#16a34a] dark:text-[#BEF264] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Search & Discover</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse through hundreds of verified hostels around UnderG, Adenike, and Orita Naira. Filter by price, amenities, and distance to campus.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-[#16a34a] dark:text-[#BEF264] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Book an Inspection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Found a place you like? Schedule a physical or virtual tour with our verified agents to ensure the property meets your expectations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-[#16a34a] dark:text-[#BEF264] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Secure Payment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pay rent safely through our escrow system. We hold the funds and only release them to the landlord when you move in and are satisfied.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 bg-[#16a34a] dark:bg-[#BEF264] rounded-3xl p-10 md:p-16 text-center shadow-xl">
          <h2 className="text-3xl font-extrabold text-white dark:text-gray-900 mb-6">
            Ready to find your next home?
          </h2>
          <p className="text-green-50 dark:text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of LAUTECH students who have found their ideal hostels with Hostel Pulse. No scams, no hidden agent fees.
          </p>
          <button className="bg-white dark:bg-gray-900 text-[#16a34a] dark:text-[#BEF264] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
