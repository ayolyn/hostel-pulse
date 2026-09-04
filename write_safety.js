const fs = require('fs');

const content = `import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Safety() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <ShieldCheck className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Safety & Escrow
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Ogbomoso has a housing scam problem. We built Hostel Pulse to end it permanently using financial escrow and physical verifications.
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-emerald-500" />
              How the Escrow Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              When you pay for a hostel in Adenike or a used generator in Under-G, your money does NOT go to the agent or seller. It is held securely in the Hostel Pulse Escrow account. 
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">The agent knows you have paid and are serious.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">You get to inspect the hostel physically. If it matches the photos, you approve the payment on your dashboard.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">If it's a scam or uninhabitable, you click "Dispute" and your money is refunded automatically.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-emerald-500" />
              Agent Verification
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Every agent, landlord, and service provider on Hostel Pulse goes through KYC (Know Your Customer). We verify their student ID, NIN, and physical office/address in Ogbomoso. If an agent tries to defraud a LAUTECH student, they are permanently banned and reported to the authorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('app/safety/page.tsx', content, 'utf8');
