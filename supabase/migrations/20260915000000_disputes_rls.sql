-- Enable RLS for escrow_transactions if not already enabled
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own escrow transactions (disputes)
CREATE POLICY "Users can view their own escrow transactions" 
ON escrow_transactions
FOR SELECT 
USING (
    (auth.uid() = payer_id) OR (auth.uid() = payee_id)
);
