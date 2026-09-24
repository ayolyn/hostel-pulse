# HostelPulse: Complete Application Flow & Architecture

This document breaks down how the entire HostelPulse platform works from start to finish, covering User Roles, Verification, the Escrow System, Wallet & Withdrawals, Reviews, Admin Functions, and AI integrations.

---

## 1. User Roles & Account Creation

HostelPulse has a unified login system, but routes users to different portals based on their role. Everyone shares a core `profiles` record (which holds their wallet balance), but they also get a specialized profile record (`student_accounts`, `agent_accounts`, etc.).

### Role Selection (Onboarding)
1. A new user signs up via `/join` (Google or Email).
2. They are redirected to the **Onboarding** page.
3. They select their intended role:
   *   **Students:** Can search for hostels, book inspections, pay into escrow, manage roommates, and buy/sell on the campus market.
   *   **Non-Students:** Similar to students but without LAUTECH-specific campus features.
   *   **Agents:** Can list properties, manage inspection requests, receive escrow payouts, and withdraw to their bank.
   *   **Landlords:** Similar to agents, but verified as the direct property owner.
4. The system creates a record in `user_roles` and their respective specialized table (e.g., `student_accounts`).

### Verification (KYC) Flow
To maintain a high-trust environment, users must be verified:
*   **Students:** Upload a picture of their LAUTECH ID card. The Admin reviews this. If it's blurry or expired, the Admin rejects it via the HQ Portal, and the student receives a notification to re-upload. Once approved, they get a "Verified Student" badge.
*   **Agents/Landlords:** Go through a business verification process. They receive a `moderation_status` which tracks if they are allowed to list properties.

---

## 2. The Core Booking & Escrow Flow

HostelPulse's biggest selling point is **Trust**. Students are afraid of being scammed by fake agents. HostelPulse solves this using a strict Escrow flow.

### Step 1: Booking & Payment (The Lock)
1. A student finds a property and clicks **"Rent Now (Secure Escrow)"**.
2. They select a move-in date and click **"Pay with Card / USSD / Bank"**.
3. **Flutterwave** securely processes the payment.
4. On success, the Flutterwave Webhook catches the payment and creates an **Escrow Transaction** in the database with the status **`Held`**.
5. The student receives an email confirming their money is safe. The agent receives a WhatsApp and in-app notification that a student has locked down the funds.
6. **Crucially:** The money is *not* in the agent's wallet yet. It is held securely by HostelPulse.

### Step 2: Inspection & Verification
1. The student contacts the agent (via the built-in chat) to schedule a physical inspection.
2. The student goes to the property to verify it looks exactly like the pictures and matches the description.

### Step 3: Releasing the Funds (The Key)
1. If the student is satisfied, they open their Student Dashboard → **Inspections Tab**.
2. They click to **Release Escrow** (or scan the Agent's unique QR code).
3. The system updates the Escrow Transaction status to **`Completed`**.
4. The system automatically credits the agent/landlord's **Wallet Balance**.
5. *Note: If the property is fake, the student can open a "Dispute", pausing the release until HostelPulse admin resolves it.*

---

## 3. The Wallet & Withdrawal System

Once the escrow is released, the funds are instantly available in the provider's wallet.

### Cross-Portal Wallets
Yes, **all portals have active wallets**. Because the `wallet_balance` lives on the central `profiles` table, a user who is a Student can fund their wallet to pay for a hostel, and an Agent can receive funds into their wallet. 

### Withdrawing to a Bank Account
1. An Agent goes to their Dashboard and clicks **Withdraw**.
2. They enter their amount, select their Bank, and type their 10-digit account number.
3. **Flutterwave Account Resolution:** The app instantly talks to Flutterwave behind the scenes to verify the account number and automatically fills in the **Account Name** (e.g., "ADEBAYO OLUWASEUN"). This prevents withdrawal typos.
4. The Agent clicks **Confirm**.
5. The system checks if they have enough balance, and if so, **atomically deducts** the money from their wallet (preventing double-withdrawal glitches).
6. The system triggers a **Flutterwave Payout (Transfer)**. Flutterwave moves the real money from the HostelPulse corporate balance to the Agent's personal bank account.
7. The transaction is logged in the `withdrawals` table.

---

## 4. The Review System

HostelPulse uses a **Provider Review System** rather than just a Property Review System. 

1. **Who can review?** Only logged-in Students or Non-Students. Providers cannot review themselves.
2. **How it works:** When a student reviews a property, the rating (1 to 5 stars) and comment are attached to the **Agent/Landlord** who listed it via the `provider_reviews` table.
3. **The impact:** The agent's average rating is aggregated and displayed publicly. It heavily influences their **"Weighted Score"**—a proprietary ranking algorithm that combines their successful deals closed with their average rating to determine how high they appear in search results.

---

## 5. The HQ Admin Portal

HostelPulse has a hidden, highly secure Admin Dashboard (`/hq_admin_...`).

The Admin is responsible for:
1. **KYC Verification:** Reviewing uploaded Student IDs and Business Documents. Approving them or rejecting them with specific reasons (e.g., "Image too blurry").
2. **Dispute Resolution:** Managing Support Tickets when an Escrow goes wrong. The Admin has the power to refund the wallet or force-release the escrow to the agent.
3. **Moderation:** Banning bad actors, removing fake property listings, and monitoring platform health.
4. **Financial Oversight:** Tracking the total Total Escrow Volume (money currently locked in the system).

---

## 6. The Campus Market

Students can buy and sell items (fridges, mattresses, textbooks) to other students.
*   The market uses the exact same Escrow engine as properties.
*   A buyer pays into Escrow.
*   The buyer meets the seller on campus to inspect the item.
*   The buyer releases the Escrow, instantly funding the seller's wallet.

---

## 7. AI & SEO Strategy (AEO / LLMO)

HostelPulse is heavily optimized for the future of search (ChatGPT, Perplexity, Claude).
*   **`robots.txt`**: Explicitly welcomes AI bots to crawl the public listings while hiding private dashboards.
*   **`llms.txt`**: Provides a clean, markdown summary of HostelPulse's purpose specifically designed for AI bots to read.
*   **JSON-LD Schema**: Every property page injects rich, structured Google Schema data (Price, Location, Reviews) into the HTML.
*   **ChatGPT Plugin:** HostelPulse has a live `.well-known/ai-plugin.json` and OpenAPI spec. This allows ChatGPT to query `/api/search` directly, so if a user asks ChatGPT "Find me a self-con in Under-G for 150k", ChatGPT will pull live data directly from your database and provide links back to your app.

---

## 8. Technical Stack Summary
*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion.
*   **Backend & DB:** Supabase (PostgreSQL), Edge Functions, Row Level Security (RLS).
*   **Payments:** Flutterwave v3 (Collections & Payouts).
*   **Emails & SMS:** Resend (Email), WhatsApp messaging queue.
*   **Hosting:** Cloudflare Pages (Edge Network for lightning-fast speeds).
