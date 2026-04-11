#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_f8d143d4953d2339d93628f83d1ef1da98613acb
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout
npx supabase functions deploy cancel-booking
npx supabase functions deploy stripe-webhook
npx supabase functions deploy admin-confirm-booking
