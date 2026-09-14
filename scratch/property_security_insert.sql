CREATE OR REPLACE FUNCTION protect_admin_property_fields() RETURNS trigger AS $$
DECLARE
    is_super_admin BOOLEAN := false;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin') INTO is_super_admin;

    IF NOT is_super_admin THEN
        IF TG_OP = 'INSERT' THEN
            -- Only protect the verification fields, allow status=active and is_active=true
            NEW.verification_status := 'Unverified';
            NEW.verified_walkthrough := false;
            NEW.address_confirmed := false;
            NEW.price_confirmed := false;
            NEW.agent_confirmed := false;
            NEW.video_confirmed := false;
            NEW.availability_confirmed := false;
            NEW.verified_at := null;
            NEW.verified_by := null;
            NEW.verification_method := null;
            NEW.verification_notes := null;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Protect Admin-Only Fields on UPDATE
            NEW.verification_status := OLD.verification_status;
            NEW.verified_at := OLD.verified_at;
            NEW.verified_by := OLD.verified_by;
            NEW.verification_method := OLD.verification_method;
            NEW.verified_walkthrough := OLD.verified_walkthrough;
            NEW.address_confirmed := OLD.address_confirmed;
            NEW.price_confirmed := OLD.price_confirmed;
            NEW.agent_confirmed := OLD.agent_confirmed;
            NEW.video_confirmed := OLD.video_confirmed;
            NEW.availability_confirmed := OLD.availability_confirmed;
            NEW.verification_notes := OLD.verification_notes;

            -- Note: We REMOVED the strict 'status' and 'is_active' locking for agents!
            -- Agents are allowed to Mark as Taken or Reactivate!

            -- Automatic Reverification Trigger on Important Changes
            -- If an ALREADY VERIFIED listing changes key details, invalidate the verification
            IF OLD.verification_status IN ('Physically Inspected', 'Details Checked') THEN
                IF NEW.price IS DISTINCT FROM OLD.price OR
                   NEW.agent_fee IS DISTINCT FROM OLD.agent_fee OR
                   NEW.agreement_fee IS DISTINCT FROM OLD.agreement_fee OR
                   NEW.caution_fee IS DISTINCT FROM OLD.caution_fee OR
                   NEW.inspection_fee IS DISTINCT FROM OLD.inspection_fee OR
                   NEW.service_charge IS DISTINCT FROM OLD.service_charge OR
                   NEW.other_fee IS DISTINCT FROM OLD.other_fee OR
                   NEW.location IS DISTINCT FROM OLD.location OR
                   NEW.video_url IS DISTINCT FROM OLD.video_url OR
                   NEW.agent_id IS DISTINCT FROM OLD.agent_id OR
                   NEW.landlord_id IS DISTINCT FROM OLD.landlord_id THEN
                    
                    NEW.verification_status := 'Requires Update';
                    NEW.verified_at := null;
                    NEW.verified_by := null;
                    NEW.verification_method := null;
                    -- Note: it REMAINS active, just loses the badge!
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;