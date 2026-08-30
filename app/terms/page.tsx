export const runtime = 'edge';
import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/90 text-gray-900 dark:text-gray-100 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <PublicHeader />
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">Effective Date: August 26, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Hostel Pulse ("we," "us" or "our"), concerning your access to and use of the Hostel Pulse website and mobile application. By using the platform, you agree that you have read, understood, and agree to be bound by all of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">2. Platform Role</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Hostel Pulse acts as a marketplace to connect students searching for accommodation with landlords and verified agents in Ogbomoso. We are not a real estate agency or a property owner. We provide a platform for listing, discovering, and securely paying for student accommodation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">3. Escrow System & Payments</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To protect both students and landlords, all rental payments made through the platform are held in the Hostel Pulse Escrow Account. Funds are only disbursed to the landlord/agent after the student has successfully moved in or within 48 hours of the scheduled move-in date, provided no dispute has been raised. Bypassing our payment system voids any fraud protection guarantees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Students:</strong> Must provide accurate information, conduct physical inspections where possible, and report any fraudulent behavior immediately.</li>
              <li><strong>Landlords/Agents:</strong> Must provide accurate property descriptions, maintain the property in habitable condition, and honor bookings confirmed through the platform. Misrepresentation of properties will lead to immediate account suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">5. Cancellations & Refunds</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If a property significantly deviates from its listing description, you may raise a dispute before funds are disbursed from escrow to claim a refund. Once you move in and confirm satisfaction, or 48 hours pass post move-in without dispute, payments are final and subject to the landlord's direct refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In no event will Hostel Pulse be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the site or services. Our liability is limited to the amount of platform service fees paid by you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}


