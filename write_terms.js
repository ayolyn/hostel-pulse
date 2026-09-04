const fs = require('fs');

const content = `import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-white/5">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>Last updated: January 2026</p>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Acceptance of Terms</h2>
          <p>
            By using Hostel Pulse (the "Platform"), you agree to abide by these Terms of Service. This platform is built exclusively to serve the LAUTECH student community in Ogbomoso, Oyo State.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. The Escrow System</h2>
          <p>
            Hostel Pulse utilizes a strict Escrow System. All payments for rent, market items, or services are held by the Platform until the buyer physically verifies and approves the transaction. By using the platform, agents and landlords agree that funds will not be released until the student confirms satisfaction. 
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. Zero-Tolerance for Scams</h2>
          <p>
            Attempting to bypass the escrow, posting fake properties in Under-G/Adenike/Seminary, or requesting direct transfers from students is strictly prohibited. Violators will face immediate ban, seizure of wallet funds, and prosecution under Nigerian Cybercrime laws.
          </p>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('app/terms/page.tsx', content, 'utf8');
