export const runtime = 'edge';
import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-black/90 text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <PublicHeader />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">Last Updated: August 2026</p>

        <div className="prose prose-green dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to Hostel Pulse ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and share your personal data when you use our student housing marketplace in Ogbomoso, in compliance with the Nigeria Data Protection Regulation (NDPR).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about our services, or when you contact us. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Personal details:</strong> Name, email address, phone number, and student matriculation number (for LAUTECH student verification).</li>
              <li><strong>Payment Data:</strong> Financial details processed securely via our payment gateways (e.g., Paystack/Flutterwave). We do not store your full card details.</li>
              <li><strong>Agent/Landlord Data:</strong> Government-issued ID, NIN, and property ownership documents for KYC verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We use personal information collected via our platform for a variety of business purposes described below:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>To facilitate account creation and logon process.</li>
              <li>To manage user bookings and our Escrow payment system safely.</li>
              <li>To enforce our terms, conditions, and policies for safety (fraud prevention).</li>
              <li>To respond to user inquiries/offer support to users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Sharing Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. For instance, limited details (like your name and phone number) are shared with verified landlords or agents when you book an inspection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards, no internet transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have questions or comments about this notice, you may email us at privacy@hostelpulse.ng or by post to:
              <br /><br />
              Hostel Pulse Hub<br />
              Opposite LAUTECH Main Gate<br />
              Ogbomoso, Oyo State, Nigeria.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}


