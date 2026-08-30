export interface FAQ {
    category: string;
    question: string;
    answer: string;
}

export const supportFAQs: FAQ[] = [
    // Escrow Shield & Payments
    { category: "Escrow Shield & Payments", question: "How does the Escrow Shield work?", answer: "When you pay for rent or an item, the money is held safely in our Escrow Vault. It is only released to the Landlord/Seller after you inspect and approve the property/item." },
    { category: "Escrow Shield & Payments", question: "How do I fund my HostelPulse Wallet?", answer: "Go to your Wallet tab, click 'Fund Wallet', and choose either Paystack, direct bank transfer, or card payment." },
    { category: "Escrow Shield & Payments", question: "How do I withdraw money from my wallet?", answer: "Go to your Wallet, click 'Withdraw', enter your bank details, and the funds will be processed within 24 hours." },
    { category: "Escrow Shield & Payments", question: "Is there a withdrawal fee?", answer: "We charge a flat minimal fee for bank transfers depending on the withdrawal amount, visible before you confirm." },
    { category: "Escrow Shield & Payments", question: "What happens if a transaction fails but my account was debited?", answer: "Failed transactions are usually reversed by your bank within 24-48 hours. If it persists, open a support ticket with your transaction reference." },
    { category: "Escrow Shield & Payments", question: "Can I pay a Landlord directly outside the platform?", answer: "We strongly advise against this. Paying outside HostelPulse voids your Escrow Shield protection, and we cannot help you if you are scammed." },
    { category: "Escrow Shield & Payments", question: "How do refunds work if I reject a property?", answer: "If you reject a property during inspection, the funds in escrow are immediately unlocked and returned to your HostelPulse Wallet." },
    { category: "Escrow Shield & Payments", question: "Can I split rent with a roommate using my wallet?", answer: "Yes, you can transfer funds internally from your wallet to your roommate's wallet for free before making the final rent payment." },
    { category: "Escrow Shield & Payments", question: "What is the minimum amount I can withdraw?", answer: "The minimum withdrawal amount is ₦1,000." },
    { category: "Escrow Shield & Payments", question: "Are my card details safe?", answer: "Yes, we do not store your card details. All payments are processed securely through our PCI-DSS compliant payment gateways." },
    
    // Finding Hostels & Inspections
    { category: "Finding Hostels & Inspections", question: "How do I request an inspection?", answer: "On any property listing, click 'Request Inspection', choose an available date and time, and wait for the Agent/Landlord to confirm." },
    { category: "Finding Hostels & Inspections", question: "What if the Agent doesn't show up for the inspection?", answer: "You can report the agent as a 'No-Show' from your 'My Requests' tab. This will refund your inspection fee (if applicable) and penalize the agent." },
    { category: "Finding Hostels & Inspections", question: "What happens if I reject a property during inspection?", answer: "Simply click 'Reject' in your portal. You are under no obligation to rent a property that doesn't meet your expectations." },
    { category: "Finding Hostels & Inspections", question: "How do I report a fake listing or suspicious agent?", answer: "Click the flag icon on the listing page or open a support ticket immediately. We will investigate and ban fraudulent accounts." },
    { category: "Finding Hostels & Inspections", question: "Can I negotiate the rent price?", answer: "Rent prices are set by the Landlord. Some landlords allow negotiation via the direct messaging system before you request an escrow hold." },
    { category: "Finding Hostels & Inspections", question: "What does 'Trust Rank' mean?", answer: "Trust Rank indicates how reliable an agent or landlord is based on their successful deals, verified properties, and student reviews." },
    { category: "Finding Hostels & Inspections", question: "How do I use the Map Explorer?", answer: "The Map Explorer lets you see properties based on their physical distance from your campus gates. You can filter by price and amenities." },
    { category: "Finding Hostels & Inspections", question: "Can I save a property to view later?", answer: "Yes, click the heart icon on any listing to add it to your 'Saved' tab." },
    { category: "Finding Hostels & Inspections", question: "How long does a Landlord have to approve my request?", answer: "Landlords have 24 hours to approve an inspection or escrow request before it automatically expires." },
    { category: "Finding Hostels & Inspections", question: "Can I book multiple inspections at once?", answer: "Yes, you can have multiple pending inspections, but ensure the times do not overlap." },
    
    // Campus Market
    { category: "Campus Market", question: "How do I sell an item on the Campus Market?", answer: "Go to the Campus Market tab, click 'Post Ad', upload clear pictures, set your price, and publish." },
    { category: "Campus Market", question: "Is it free to sell items?", answer: "Posting standard ads is completely free for students." },
    { category: "Campus Market", question: "How does Escrow work for the Campus Market?", answer: "Buyers pay into Escrow. You deliver the item, the buyer inspects it, clicks 'Accept', and the money is released to your wallet." },
    { category: "Campus Market", question: "What if a buyer scams me and takes the item without clicking Accept?", answer: "Never hand over an item until the app confirms the funds are locked in Escrow. If there is a dispute, escalate to an Admin via the Support chat." },
    { category: "Campus Market", question: "How do I edit or delete my market listing?", answer: "Go to your profile, find your active listings, and select edit or delete." },
    { category: "Campus Market", question: "What items are prohibited on the Campus Market?", answer: "Illegal substances, weapons, stolen goods, and academic assignment writing services are strictly banned." },
    { category: "Campus Market", question: "Can I report a misleading market ad?", answer: "Yes, use the 'Report' button on the ad page if the item is fake, overpriced, or suspicious." },
    { category: "Campus Market", question: "How do I communicate with a seller?", answer: "Use the in-app messaging system. Do not take conversations to WhatsApp to ensure you remain protected by our policies." },
    { category: "Campus Market", question: "What does the 'New Seller' badge mean?", answer: "It means the user has not yet completed a verified Escrow transaction on the market. Always use Escrow with new sellers." },
    { category: "Campus Market", question: "Does HostelPulse handle delivery?", answer: "Currently, buyers and sellers must arrange their own campus meetups for item exchanges." },
    
    // Roommate Finder
    { category: "Roommate Finder", question: "How do I find a roommate?", answer: "Go to the Roommates tab, set your matching preferences (budget, cleanliness, habits), and swipe through compatible profiles." },
    { category: "Roommate Finder", question: "Can I hide my roommate profile?", answer: "Yes, you can toggle your profile visibility to 'Hidden' in your Roommate settings if you are no longer looking." },
    { category: "Roommate Finder", question: "What if a roommate match is harassing me?", answer: "Use the 'Block' button on their profile and report them to Support immediately. We have a zero-tolerance policy for harassment." },
    { category: "Roommate Finder", question: "Does HostelPulse do background checks on roommates?", answer: "We verify student status via university ID, but we do not perform criminal background checks. Always meet in public first." },
    { category: "Roommate Finder", question: "Can I search for roommates in a specific hostel?", answer: "Yes, you can filter roommate searches based on specific off-campus areas or specific listed hostels." },
    { category: "Roommate Finder", question: "How do I change my roommate preferences?", answer: "Go to the Roommates tab and click the 'Filters' or 'Preferences' icon to update your lifestyle choices." },
    { category: "Roommate Finder", question: "What happens if my roommate and I have a dispute over rent?", answer: "We recommend drafting a written agreement before moving in. HostelPulse cannot legally intervene in personal roommate disputes after the lease is signed." },
    { category: "Roommate Finder", question: "Can landlords see my roommate profile?", answer: "No, the Roommate Finder is strictly peer-to-peer for students only." },
    { category: "Roommate Finder", question: "Is the Roommate Finder free to use?", answer: "Yes, connecting and messaging potential roommates is completely free." },
    { category: "Roommate Finder", question: "How many people can I match with?", answer: "There is no limit. You can match and message as many potential roommates as you need to find the perfect fit." },
    
    // Services & Artisans
    { category: "Services & Artisans", question: "How do I book a service (e.g., plumber, cleaner)?", answer: "Go to the Services tab, select the category, browse vetted artisans, and request a booking." },
    { category: "Services & Artisans", question: "Are the artisans verified?", answer: "Yes, all artisans on the platform go through an identity verification process for campus safety." },
    { category: "Services & Artisans", question: "How do I pay for a service?", answer: "Payments for services are also routed through the Escrow Wallet. The artisan is paid after you confirm the job is done." },
    { category: "Services & Artisans", question: "What if the artisan damages my property?", answer: "Open a dispute ticket immediately. Do not release the Escrow funds. Our Admin team will step in to mediate the situation." },
    { category: "Services & Artisans", question: "Can I leave a review for an artisan?", answer: "Yes, after a job is marked as complete, you will be prompted to leave a star rating and a written review." },
    { category: "Services & Artisans", question: "What if the artisan doesn't show up?", answer: "You can cancel the booking from your dashboard and your escrow funds will be fully refunded to your wallet." },
    { category: "Services & Artisans", question: "How do I apply to become an artisan?", answer: "If you have a skill to offer, you can apply for a Service Provider account via the Support hub or main website." },
    { category: "Services & Artisans", question: "Can I negotiate the service price?", answer: "Most services have standard rates, but custom jobs can be negotiated with the artisan before you lock funds in Escrow." },
    { category: "Services & Artisans", question: "How do I contact an artisan before booking?", answer: "You can send them a direct message through the platform to explain your specific needs before booking." },
    { category: "Services & Artisans", question: "What if the completed job is of poor quality?", answer: "Do not release the funds. Click 'Raise Dispute' in your Services tab so our team can investigate." }
];
