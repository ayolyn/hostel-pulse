import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | HostelPulse',
    description: 'Learn how HostelPulse collects, uses, and protects your personal data.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-10">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-white/10 uppercase tracking-wide">{title}</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">{children}</div>
    </div>
);

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100">
            <PublicHeader />
            <div className="pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-3 block">Legal</span>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: September 2026 &mdash; Effective immediately upon publication.</p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 sm:p-10 md:p-14">

                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base leading-relaxed">
                            HostelPulse Technologies (&ldquo;HostelPulse&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website <strong>hostelpulse.app</strong> and its associated mobile progressive web application. We are committed to protecting your privacy. This Privacy Policy explains what personal data we collect, why we collect it, how it is used, and your rights over it.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-10 text-sm sm:text-base leading-relaxed">
                            By creating an account or using any feature of HostelPulse, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the platform.
                        </p>

                        <Section title="1. Who We Are">
                            <p>HostelPulse is a Nigerian property technology (PropTech) platform headquartered in Ogbomoso, Oyo State, Nigeria. We operate a verified marketplace connecting students, renters, buyers, agents, and landlords for residential accommodation, shortlet apartments, commercial spaces, and land in Ogbomoso and surrounding areas.</p>
                        </Section>

                        <Section title="2. Information We Collect">
                            <p><strong className="text-gray-800 dark:text-white">Account Information:</strong> When you sign up, we collect your full name, email address, phone number, and account type (Student, Buyer/Renter, Agent, or Landlord).</p>
                            <p><strong className="text-gray-800 dark:text-white">Student Verification:</strong> For student accounts, we may request a student identification document such as a LAUTECH matric number, student ID card, or portal screenshot. This is used solely to verify your student status.</p>
                            <p><strong className="text-gray-800 dark:text-white">Agent & Landlord KYC:</strong> For agent and landlord accounts, we collect identity verification documents including National Identification Number (NIN), a government-issued ID, a business address in Ogbomoso, and optionally a CAC registration certificate. This data is required for provider verification.</p>
                            <p><strong className="text-gray-800 dark:text-white">Profile Information:</strong> You may optionally provide your date of birth, a profile photo or business logo, social media links, and a short bio or organisation description.</p>
                            <p><strong className="text-gray-800 dark:text-white">Property & Listing Data:</strong> When providers create listings, we store property details including location, price, images, video walkthroughs, room type, and availability.</p>
                            <p><strong className="text-gray-800 dark:text-white">Financial Data:</strong> All payment transactions are processed by third-party payment gateways (Flutterwave, OPay, and similar providers). We do not store raw card numbers or banking credentials. We retain transaction IDs, amounts, timestamps, payer and payee identifiers, and escrow status for dispute resolution and audit purposes.</p>
                            <p><strong className="text-gray-800 dark:text-white">Communications:</strong> Messages sent between users on our in-app messaging system are stored to enable conversation history and dispute evidence. We may review flagged messages to investigate reports of abuse or fraud.</p>
                            <p><strong className="text-gray-800 dark:text-white">Device & Usage Data:</strong> We may automatically collect browser type, device information, IP address, and anonymised usage analytics (pages visited, search queries, clicks) to improve platform performance.</p>
                            <p><strong className="text-gray-800 dark:text-white">Newsletter Subscriptions:</strong> If you subscribe to our newsletter, we store your email address to send you updates about LAUTECH housing and platform news.</p>
                        </Section>

                        <Section title="3. How We Use Your Information">
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Create and maintain your HostelPulse account</li>
                                <li>Verify your identity and prevent fraudulent accounts</li>
                                <li>Process and track escrow payments securely</li>
                                <li>Display your listings and profile to other platform users</li>
                                <li>Enable in-app messaging between renters and providers</li>
                                <li>Handle disputes between buyers and sellers</li>
                                <li>Send you notifications about bookings, payments, and platform updates</li>
                                <li>Send newsletter emails if you have opted in</li>
                                <li>Comply with applicable Nigerian law and regulatory requirements</li>
                                <li>Improve our platform features and fix technical issues</li>
                            </ul>
                        </Section>

                        <Section title="4. Legal Basis for Processing">
                            <p>We process your data on the following grounds under the Nigeria Data Protection Act 2023 (NDPA) and, where applicable, the GDPR:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li><strong className="text-gray-800 dark:text-white">Contractual necessity:</strong> Processing required to deliver the platform services you have agreed to.</li>
                                <li><strong className="text-gray-800 dark:text-white">Legitimate interest:</strong> Fraud prevention, platform security, and analytics.</li>
                                <li><strong className="text-gray-800 dark:text-white">Consent:</strong> For optional data such as newsletter subscriptions or optional profile fields.</li>
                                <li><strong className="text-gray-800 dark:text-white">Legal obligation:</strong> Reporting to law enforcement when required by Nigerian law.</li>
                            </ul>
                        </Section>

                        <Section title="5. Data Sharing & Disclosure">
                            <p>We do not sell your personal data. We may share your information in the following limited circumstances:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li><strong className="text-gray-800 dark:text-white">Between platform users:</strong> Your name, profile photo, and listing information are visible to other users as part of normal platform use. Your phone number or WhatsApp number is only shared if you have enabled it in your profile settings.</li>
                                <li><strong className="text-gray-800 dark:text-white">Payment processors:</strong> We share necessary transaction data with Flutterwave, OPay, and similar processors to execute payments.</li>
                                <li><strong className="text-gray-800 dark:text-white">Cloud infrastructure:</strong> We use Supabase (a PostgreSQL cloud database) and Cloudflare for hosting and content delivery. Your data is stored on their servers in compliance with applicable data protection standards.</li>
                                <li><strong className="text-gray-800 dark:text-white">Law enforcement:</strong> If a user is reported for fraud, scamming, or criminal activity, we will cooperate fully with the Nigerian Police Force, the Economic and Financial Crimes Commission (EFCC), and LAUTECH security as required by law. KYC data may be provided as evidence of identity.</li>
                                <li><strong className="text-gray-800 dark:text-white">Legal proceedings:</strong> We may disclose your information where required by court order or other legal process.</li>
                            </ul>
                        </Section>

                        <Section title="6. Data Retention">
                            <p>We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal profile data within 30 days, subject to the following exceptions:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Transaction and escrow records are retained for a minimum of 5 years for financial audit and legal compliance purposes.</li>
                                <li>KYC documents for verified agents and landlords are retained for 3 years after account closure.</li>
                                <li>Data subject to an active dispute or legal investigation will be retained until the matter is resolved.</li>
                            </ul>
                        </Section>

                        <Section title="7. Your Rights">
                            <p>Under the Nigeria Data Protection Act 2023, you have the right to:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li><strong className="text-gray-800 dark:text-white">Access:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong className="text-gray-800 dark:text-white">Rectification:</strong> Correct inaccurate data (you can update most information directly in your profile).</li>
                                <li><strong className="text-gray-800 dark:text-white">Erasure:</strong> Request deletion of your account and associated data, subject to legal retention requirements.</li>
                                <li><strong className="text-gray-800 dark:text-white">Objection:</strong> Object to processing for purposes not necessary for the service.</li>
                                <li><strong className="text-gray-800 dark:text-white">Data portability:</strong> Request your data in a structured, machine-readable format.</li>
                            </ul>
                            <p>To exercise any of these rights, email us at <strong className="text-gray-800 dark:text-white">privacy@hostelpulse.app</strong>. We will respond within 30 days.</p>
                        </Section>

                        <Section title="8. Cookies & Local Storage">
                            <p>HostelPulse uses browser local storage and session cookies to maintain your login session, remember your theme preference (light/dark mode), and track which platform notifications you have already seen. These are strictly functional and do not track you across other websites.</p>
                            <p>We do not use third-party advertising cookies or tracking pixels.</p>
                        </Section>

                        <Section title="9. Security">
                            <p>We take data security seriously. All data is encrypted in transit using TLS/HTTPS. Our database is hosted on Supabase with row-level security policies. We enforce strict authentication and role-based access controls across all platform portals. However, no internet service can guarantee 100% security, and you use the platform at your own risk.</p>
                        </Section>

                        <Section title="10. Children's Privacy">
                            <p>HostelPulse is not intended for persons under the age of 16. We do not knowingly collect personal data from minors. If you believe a minor has created an account, please contact us at <strong className="text-gray-800 dark:text-white">privacy@hostelpulse.app</strong> and we will remove the account promptly.</p>
                        </Section>

                        <Section title="11. Changes to This Policy">
                            <p>We may update this Privacy Policy from time to time. When we make significant changes, we will notify users via an in-app notification and update the &ldquo;Last updated&rdquo; date above. Your continued use of the platform after any change constitutes your acceptance of the revised policy.</p>
                        </Section>

                        <Section title="12. Contact Us">
                            <p>For privacy-related queries, data access requests, or complaints, contact:</p>
                            <p className="mt-2">
                                <strong className="text-gray-800 dark:text-white">HostelPulse Technologies</strong><br />
                                Email: <a href="mailto:privacy@hostelpulse.app" className="text-[#BEF264] hover:underline">privacy@hostelpulse.app</a><br />
                                Support: <a href="mailto:info@hostelpulse.app" className="text-[#BEF264] hover:underline">info@hostelpulse.app</a><br />
                                Location: Ogbomoso, Oyo State, Nigeria
                            </p>
                        </Section>

                    </div>
                </div>
            </div>
        </div>
    );
}
