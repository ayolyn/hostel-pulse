ALTER TABLE landlord_accounts 
ADD COLUMN has_accepted_terms BOOLEAN DEFAULT FALSE;

ALTER TABLE agent_accounts 
ADD COLUMN has_accepted_terms BOOLEAN DEFAULT FALSE;
