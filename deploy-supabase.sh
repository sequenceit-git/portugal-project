#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_e80864bcae20614b794bdcd2379b0ff9428b09f3
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout
npx supabase functions deploy cancel-booking
npx supabase functions deploy stripe-webhook
npx supabase functions deploy admin-confirm-booking
