-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC NOT NULL DEFAULT 0,
    locked_balance NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'NGN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing balances
-- In HostelPulse, the old balances were in profiles.wallet_balance
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='wallet_balance') THEN
        INSERT INTO public.wallets (user_id, balance)
        SELECT id, COALESCE(wallet_balance, 0)
        FROM public.profiles
        ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;
    END IF;
END $$;

-- Create user_security table
CREATE TABLE IF NOT EXISTS public.user_security (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_hash TEXT,
    pin_set BOOLEAN NOT NULL DEFAULT FALSE,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create saved_bank_accounts table
CREATE TABLE IF NOT EXISTS public.saved_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_code TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payout_requests table
CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED');

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    bank_code TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    flw_transfer_id TEXT,
    flw_reference TEXT UNIQUE,
    status payout_status NOT NULL DEFAULT 'PENDING',
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stored Procedure for atomic withdrawal processing
CREATE OR REPLACE FUNCTION public.process_withdrawal_debit(
    p_user_id UUID,
    p_amount NUMERIC,
    p_reference TEXT,
    p_bank_code TEXT,
    p_account_number TEXT,
    p_account_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance NUMERIC;
    v_payout_id UUID;
BEGIN
    -- Lock the wallet row
    SELECT balance INTO v_balance
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Update balances
    UPDATE public.wallets
    SET balance = balance - p_amount,
        locked_balance = locked_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Insert payout request
    INSERT INTO public.payout_requests (user_id, amount, bank_code, account_number, account_name, flw_reference, status)
    VALUES (p_user_id, p_amount, p_bank_code, p_account_number, p_account_name, p_reference, 'PROCESSING')
    RETURNING id INTO v_payout_id;

    RETURN v_payout_id;
END;
$$;

-- Stored Procedure for refunding locked balance
CREATE OR REPLACE FUNCTION public.process_withdrawal_refund(
    p_user_id UUID,
    p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Lock the wallet row
    PERFORM id
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Update balances
    UPDATE public.wallets
    SET balance = balance + p_amount,
        locked_balance = locked_balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$;

-- Stored Procedure for successful withdrawal
CREATE OR REPLACE FUNCTION public.process_withdrawal_success(
    p_user_id UUID,
    p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Lock the wallet row
    PERFORM id
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Update balances
    UPDATE public.wallets
    SET locked_balance = locked_balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$;
