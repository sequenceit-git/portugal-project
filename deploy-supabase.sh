#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_8cddc150ef8434dfc32e5a2c8146867d7c804263
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout
npx supabase functions deploy cancel-booking
npx supabase functions deploy stripe-webhook
npx supabase functions deploy admin-confirm-booking
