-- Migration: HQ Vault Expansion
-- Adds support_tickets and system_announcements tables, plus status columns

-- 1. Ensure user accounts have status columns
DO $$
BEGIN
    -- Student Accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_accounts' AND column_name='status') THEN
        ALTER TABLE student_accounts ADD COLUMN status text DEFAULT 'active';
    END IF;
    
    -- Agent Accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agent_accounts' AND column_name='status') THEN
        ALTER TABLE agent_accounts ADD COLUMN status text DEFAULT 'active';
    END IF;

    -- Landlord Accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='landlord_accounts' AND column_name='status') THEN
        ALTER TABLE landlord_accounts ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- 2. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    subject text NOT NULL,
    status text DEFAULT 'Open' CHECK (status IN ('Open', 'Pending', 'Resolved')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Support messages mapping (reusing existing messages table or creating a new one)
-- To keep support chat clean, we'll create a dedicated support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. System Announcements Table
CREATE TABLE IF NOT EXISTS system_announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message text NOT NULL,
    type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Support Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: Admin policies handled at application level or via super_admin role checks in DB if implemented

-- RLS for Support Messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages of their tickets" ON support_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = support_messages.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert messages to their tickets" ON support_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = support_messages.ticket_id AND user_id = auth.uid()) AND is_admin = false
);

-- RLS for Announcements
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view announcements" ON system_announcements FOR SELECT USING (true);
