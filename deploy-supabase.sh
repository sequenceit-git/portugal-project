#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_d09c41294ca98ee259891379320a81b10a622369
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy cancel-booking --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy admin-confirm-booking --no-verify-jwt
