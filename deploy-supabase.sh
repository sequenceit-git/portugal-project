#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_811a21a27f27c1a9f212689001dcef932a051f7f
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy cancel-booking --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy admin-confirm-booking --no-verify-jwt
