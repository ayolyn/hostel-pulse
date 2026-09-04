const fs = require('fs');

const content = `import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-4">
      <PublicHeader />
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-white/5">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>Last updated: January 2026</p>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Information We Collect</h2>
          <p>
            When you register on Hostel Pulse, we collect personal information such as your name, phone number, email address, and student identification (e.g., LAUTECH matric number or portal screenshot). For agents and landlords, we collect KYC documents including NIN and physical office addresses in Ogbomoso.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Escrow & Financial Data</h2>
          <p>
            All financial transactions (rent payments, market purchases) are processed securely through third-party payment gateways (Paystack, Flutterwave, or OPay). We do not store your raw credit card numbers. We retain transaction IDs to facilitate the anti-scam escrow release mechanism.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. How We Use Your Data</h2>
          <p>
            Your data is used strictly to verify your identity, prevent fraud, and facilitate secure transactions on the platform. If you are reported for scamming a student on this platform, your identity and KYC data will be handed over to the Nigerian Police Force and LAUTECH security.
          </p>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('app/privacy/page.tsx', content, 'utf8');
