#!/bin/bash
echo "Note: You need SUPABASE_DB_PASSWORD to push."
export SUPABASE_ACCESS_TOKEN=sbp_053833ae67067c0eff18e02ccba931e9ea73b70a
npx supabase link --project-ref zgwtpnrggmmvuukcikha
npx supabase db push
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy cancel-booking --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
