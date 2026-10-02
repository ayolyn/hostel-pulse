@echo off
git add hooks/useFlutterwave.ts app/api/webhooks/flutterwave/route.ts components/dashboard/WalletTab.tsx
git commit -m "fix(wallet): prevent phantom escrow records on deposits + add deposit email receipt" -m "ROOT CAUSE: useFlutterwave.ts client callback was upserting escrow_transactions for ALL payment types including deposits" -m "- Skip escrow_transactions upsert when meta.type === deposit (hooks/useFlutterwave.ts)" -m "- Skip bookings.update for deposit payments in client callback" -m "- Add direct email receipt in webhook deposit flow using sendNotificationEmail" -m "- Add wallet_transactions record for deposit audit trail" -m "- Use atomic increment_wallet_balance RPC (created in Supabase) to prevent race conditions" -m "- Remove TransactionHistoryTable from WalletTab (now in Profile > My Transactions)" -m "- Remove payout_requests fetch from WalletTab (reduces unnecessary DB calls)"
git push origin main
echo Done.
