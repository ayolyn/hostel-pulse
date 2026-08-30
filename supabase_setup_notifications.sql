-- ============================================================
-- 1. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'success', 'warning', 'info', 'error'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Generic Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (p_user_id, p_title, p_message, p_type);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. SUPPORT TICKETS TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_support_ticket_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Escalate
    IF NEW.status = 'Pending Admin' AND OLD.status != 'Pending Admin' THEN
        PERFORM create_notification(
            NEW.user_id,
            'Ticket Escalated',
            'Ticket Escalated: An Admin has been notified and will join the chat shortly.',
            'warning'
        );
    END IF;

    -- Resolved
    IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' THEN
        PERFORM create_notification(
            NEW.user_id,
            'Ticket Closed',
            'Ticket Closed: Your support ticket has been marked as resolved.',
            'success'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_support_ticket_update ON support_tickets;
CREATE TRIGGER on_support_ticket_update
    AFTER UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_support_ticket_notifications();

-- ============================================================
-- 3. INSPECTIONS TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_inspection_notifications()
RETURNS TRIGGER AS $$
DECLARE
    prop_title TEXT;
    landlord UUID;
BEGIN
    -- Fetch property details safely
    SELECT title, landlord_id INTO prop_title, landlord FROM properties WHERE id = NEW.property_id;

    IF TG_OP = 'INSERT' THEN
        -- Notify agent/landlord of new inspection
        PERFORM create_notification(
            landlord,
            'Inspection Requested',
            'New Inquiry: A student has requested an inspection for ' || prop_title || ' in Ogbomoso.',
            'info'
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Inspection Approved
        IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
            PERFORM create_notification(
                NEW.requester_id,
                'Inspection Confirmed',
                'Inspection Confirmed: Your visit to ' || prop_title || ' has been scheduled.',
                'success'
            );
        END IF;

        -- Inspection Declined
        IF NEW.status = 'Declined' AND OLD.status != 'Declined' THEN
            PERFORM create_notification(
                NEW.requester_id,
                'Inspection Declined',
                'Inspection Declined: The agent could not accommodate your request for ' || prop_title || '. Please pick another date.',
                'warning'
            );
        END IF;
        
        -- Property Rejected (by student after inspection)
        IF NEW.status = 'Rejected' AND OLD.status != 'Rejected' THEN
            PERFORM create_notification(
                landlord,
                'Property Rejected',
                'Property Rejected: The student decided not to proceed with ' || prop_title || ' after inspection.',
                'error'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_inspection_insert ON inspections;
CREATE TRIGGER on_inspection_insert
    AFTER INSERT ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_inspection_notifications();

DROP TRIGGER IF EXISTS on_inspection_update ON inspections;
CREATE TRIGGER on_inspection_update
    AFTER UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_inspection_notifications();

-- ============================================================
-- 4. PROFILES / VERIFICATION TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_account_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- Approval
    IF NEW.is_approved = TRUE AND OLD.is_approved = FALSE THEN
        PERFORM create_notification(
            NEW.id,
            'Verification Complete',
            'Verification Complete! Your account is now fully verified. Welcome to HostelPulse.',
            'success'
        );
    END IF;
    
    -- Rejection
    IF NEW.is_approved = FALSE AND OLD.is_approved = TRUE THEN
        PERFORM create_notification(
            NEW.id,
            'Verification Failed',
            'Verification Failed: Your submitted document was not accepted. Please upload a valid LAUTECH student ID or government ID.',
            'error'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all account tables
DROP TRIGGER IF EXISTS on_student_verify ON student_accounts;
CREATE TRIGGER on_student_verify AFTER UPDATE ON student_accounts FOR EACH ROW EXECUTE FUNCTION trigger_account_verification();

DROP TRIGGER IF EXISTS on_non_student_verify ON non_student_accounts;
CREATE TRIGGER on_non_student_verify AFTER UPDATE ON non_student_accounts FOR EACH ROW EXECUTE FUNCTION trigger_account_verification();

DROP TRIGGER IF EXISTS on_landlord_verify ON landlord_accounts;
CREATE TRIGGER on_landlord_verify AFTER UPDATE ON landlord_accounts FOR EACH ROW EXECUTE FUNCTION trigger_account_verification();

DROP TRIGGER IF EXISTS on_agent_verify ON agent_accounts;
CREATE TRIGGER on_agent_verify AFTER UPDATE ON agent_accounts FOR EACH ROW EXECUTE FUNCTION trigger_account_verification();

-- ============================================================
-- 5. FUTURE SCHEMAS STUBS (PHASE 2)
-- ============================================================
-- Escrow Shield & Wallet
-- TODO: Add triggers for wallet_transactions (Wallet Funded, Withdrawal Initiated)
-- TODO: Add triggers for escrow (Escrow Locked, Funds Released, Dispute Raised)

-- Campus Market
-- TODO: Add triggers for market_ads (Market Ad Published)
-- TODO: Add triggers for market_orders (Item Order Placed)

-- Roommates
-- TODO: Add triggers for roommate_matches (Roommate Match, Roommate Confirmed)

-- Services & Artisans
-- TODO: Add triggers for service_bookings (Service Booked, Job Marked Done)
