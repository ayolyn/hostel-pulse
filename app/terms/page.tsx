import React from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | HostelPulse",
    description: "Read the Terms of Service governing your use of the HostelPulse platform.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-10">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-white/10 uppercase tracking-wide">{title}</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">{children}</div>
    </div>
);

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100">
            <PublicHeader />
            <div className="pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-3 block">Legal</span>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">Terms of Service</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: September 2026 &mdash; Effective immediately upon publication.</p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 sm:p-10 md:p-14">

                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base leading-relaxed">
                            Welcome to HostelPulse. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the HostelPulse website (<strong>hostelpulse.app</strong>) and its progressive web application (collectively, the &ldquo;Platform&rdquo;), operated by HostelPulse Technologies (&ldquo;HostelPulse&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-10 text-sm sm:text-base leading-relaxed">
                            By registering an account or using any service on this Platform, you confirm that you have read, understood, and agree to be legally bound by these Terms. If you do not agree to these Terms, you may not use the Platform.
                        </p>

                        <Section title="1. Who May Use the Platform">
                            <p>You must be at least 16 years of age to create an account and use the Platform. By registering, you represent that you are at least 16 years old. The Platform is primarily intended for residents of and visitors to Ogbomoso, Oyo State, Nigeria, including current and prospective students of Ladoke Akintola University of Technology (LAUTECH).</p>
                        </Section>

                        <Section title="2. Account Types & Responsibilities">
                            <p>HostelPulse offers the following account types:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li><strong className="text-gray-800 dark:text-white">Student:</strong> University students seeking accommodation, roommates, or engaging in campus commerce. Student accounts may be required to verify their student status.</li>
                                <li><strong className="text-gray-800 dark:text-white">Buyer/Renter:</strong> Non-student individuals seeking accommodation or property to purchase in Ogbomoso.</li>
                                <li><strong className="text-gray-800 dark:text-white">Agent:</strong> Licensed or practising real estate agents listing properties on behalf of landlords. Agents must complete KYC verification before listing.</li>
                                <li><strong className="text-gray-800 dark:text-white">Landlord:</strong> Property owners listing their own properties. Landlords must complete KYC verification before their listings go live.</li>
                            </ul>
                            <p>You are responsible for maintaining the security of your account credentials. You must notify us immediately at <strong className="text-gray-800 dark:text-white">info@hostelpulse.app</strong> if you suspect unauthorised access to your account. HostelPulse is not liable for any loss caused by unauthorised use of your account.</p>
                            <p>You may not create multiple accounts or impersonate another person or entity.</p>
                        </Section>

                        <Section title="3. Property Listings">
                            <p>Agents and Landlords (&ldquo;Providers&rdquo;) who list properties on the Platform agree to the following:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>All listing information — including price, location, photos, and room descriptions — must be accurate and truthful. Posting fictitious, misleading, or fraudulent listings is strictly prohibited.</li>
                                <li>Photos and video walkthroughs must be of the actual property being listed. Stock photos or images of different properties are not permitted.</li>
                                <li>Providers must have the legal authority to list the property (as owner or as an authorised agent of the owner).</li>
                                <li>Listings are subject to review and approval by HostelPulse. We reserve the right to reject or remove any listing at our sole discretion without notice.</li>
                                <li>Providers are responsible for updating listings to reflect changes in availability, pricing, or property condition.</li>
                            </ul>
                        </Section>

                        <Section title="4. The Escrow Payment System">
                            <p>HostelPulse operates a mandatory escrow system for all financial transactions on the Platform. By using our payment features, all parties agree to the following:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>When a user makes a payment (for rent, property purchase, inspection fee, or marketplace item), the funds are held securely by HostelPulse until the transaction is confirmed.</li>
                                <li>Funds are only released to the Provider after the buyer/renter confirms receipt and satisfaction, or after the applicable holding period has elapsed.</li>
                                <li>In the event of a dispute, both parties must submit their case through the in-app dispute resolution system. HostelPulse will review the evidence submitted by both parties and make a final determination on fund release.</li>
                                <li>HostelPulse may deduct a service fee from transactions as disclosed at the time of payment.</li>
                                <li>HostelPulse is not a bank or licensed financial institution. We act as an intermediary custodian of funds during the escrow period only.</li>
                            </ul>
                        </Section>

                        <Section title="5. Prohibited Conduct">
                            <p>You agree not to engage in any of the following on the Platform:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Requesting or accepting payments outside the escrow system (direct bank transfers, cash payments, or any off-platform payment method)</li>
                                <li>Posting fake, duplicate, or misleading property listings</li>
                                <li>Impersonating another user, landlord, or HostelPulse staff</li>
                                <li>Using the messaging system to send spam, threats, or unsolicited advertisements</li>
                                <li>Attempting to defraud, deceive, or manipulate other users in any way</li>
                                <li>Using automated bots or scrapers to extract listing data</li>
                                <li>Circumventing, disabling, or interfering with security features of the Platform</li>
                                <li>Engaging in any conduct that violates applicable Nigerian law, including the Cybercrimes (Prohibition, Prevention, Etc.) Act 2015</li>
                            </ul>
                        </Section>

                        <Section title="6. Inspection Services">
                            <p>Users may book physical property inspections through verified agents on the Platform. The following terms apply to inspections:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Inspection fees are paid in advance through the escrow system and are non-refundable once the inspection is completed.</li>
                                <li>Inspections must be conducted in a public or semi-public setting. HostelPulse agents should never request to meet in a secluded location.</li>
                                <li>HostelPulse is not liable for any personal safety incidents that occur during a property inspection. Users inspect at their own risk and are encouraged to take precautions.</li>
                                <li>If an agent fails to show up for a confirmed inspection, the inspection fee will be refunded in full.</li>
                            </ul>
                        </Section>

                        <Section title="7. Campus Marketplace">
                            <p>Students may buy and sell items through the HostelPulse Campus Marketplace. Marketplace transactions are subject to the escrow system. The following additional terms apply:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Only lawful items may be listed. Prohibited items include but are not limited to: illegal drugs, weapons, counterfeit goods, stolen property, exam papers or academic fraud materials.</li>
                                <li>Sellers must accurately describe the condition of items listed (new, used, refurbished).</li>
                                <li>HostelPulse is not a party to marketplace transactions and is not responsible for the quality, legality, or delivery of goods listed.</li>
                            </ul>
                        </Section>

                        <Section title="8. Campus Gigs">
                            <p>The Campus Gigs feature allows users to offer and hire campus services. By using this feature:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Service providers must deliver the agreed service as described.</li>
                                <li>Services that violate academic integrity (e.g., writing assignments for another student) are strictly prohibited.</li>
                                <li>HostelPulse does not endorse or guarantee the quality of any gig service listed on the Platform.</li>
                            </ul>
                        </Section>

                        <Section title="9. Intellectual Property">
                            <p>All content on the Platform not uploaded by users — including the HostelPulse brand name, logo, design, code, and text — is owned by HostelPulse Technologies and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute our content without prior written permission.</p>
                            <p>By uploading photos, videos, or other content to the Platform, you grant HostelPulse a non-exclusive, royalty-free licence to display that content on the Platform for the purpose of delivering the service. You retain ownership of your uploaded content.</p>
                        </Section>

                        <Section title="10. Anti-Fraud & Law Enforcement">
                            <p>HostelPulse has a zero-tolerance policy for fraud and scams. If a user is found to have:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Posted a fake property or impersonated a legitimate landlord</li>
                                <li>Solicited off-platform payments and disappeared</li>
                                <li>Used a false identity or forged KYC documents</li>
                                <li>Engaged in any form of financial fraud on the Platform</li>
                            </ul>
                            <p>HostelPulse will immediately: (a) suspend and permanently ban the account; (b) freeze and seize any wallet balance associated with the account; and (c) report the user, along with all available identifying data (name, phone number, NIN, device fingerprint, transaction records), to the Nigerian Police Force, the Economic and Financial Crimes Commission (EFCC), and/or LAUTECH security where applicable.</p>
                        </Section>

                        <Section title="11. Disclaimers & Limitation of Liability">
                            <p>The Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. HostelPulse makes no warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
                            <p>To the maximum extent permitted by applicable law, HostelPulse shall not be liable for:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                                <li>Any indirect, incidental, or consequential damages arising from your use of the Platform</li>
                                <li>The conduct, content, or actions of other users on the Platform</li>
                                <li>Loss of data, revenue, or profits</li>
                                <li>Any inaccuracies in property listings provided by third-party agents or landlords</li>
                                <li>Service interruptions, downtime, or technical failures</li>
                            </ul>
                            <p>Our total aggregate liability to you for any claim arising out of your use of the Platform shall not exceed the amount you paid to HostelPulse in the 12 months preceding the incident giving rise to the claim.</p>
                        </Section>

                        <Section title="12. Account Suspension & Termination">
                            <p>HostelPulse reserves the right to suspend or terminate any account, with or without notice, for violations of these Terms, suspicious activity, or any conduct that we determine is harmful to the Platform or its users. If your account is suspended or terminated, you may not create a new account without our prior written consent. Termination does not entitle you to a refund of any service fees already paid.</p>
                        </Section>

                        <Section title="13. Governing Law & Dispute Resolution">
                            <p>These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising out of or in connection with these Terms that cannot be resolved amicably shall be submitted to the exclusive jurisdiction of the courts of Oyo State, Nigeria.</p>
                            <p>Before initiating legal proceedings, both parties agree to attempt good-faith resolution through direct communication for a minimum period of 30 days.</p>
                        </Section>

                        <Section title="14. Changes to These Terms">
                            <p>We may update these Terms at any time. Material changes will be communicated via an in-app notification. Continued use of the Platform after the effective date of any update constitutes acceptance of the revised Terms. If you do not accept the revised Terms, you must stop using the Platform and may request account deletion.</p>
                        </Section>

                        <Section title="15. Contact">
                            <p>For questions about these Terms:</p>
                            <p className="mt-2">
                                <strong className="text-gray-800 dark:text-white">HostelPulse Technologies</strong><br />
                                Email: <a href="mailto:legal@hostelpulse.app" className="text-[#BEF264] hover:underline">legal@hostelpulse.app</a><br />
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
