#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_6563972afeb7559e9f71eb5efd8a88f02c9e5017
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout
npx supabase functions deploy cancel-booking
npx supabase functions deploy stripe-webhook
npx supabase functions deploy admin-confirm-booking
