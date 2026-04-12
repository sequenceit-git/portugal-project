#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_a73fd03d0b7bbbb7a17f5ed7af72d5d9aaf60398
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy cancel-booking --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy admin-confirm-booking --no-verify-jwt
