-- ============================================================
-- 012: Redis Integration via Upstash REST API
-- ============================================================
-- Uses the PostgreSQL http extension to communicate with
-- Upstash Redis via its REST API. This avoids the native
-- Redis FDW's TLS/CryptoProvider bug in wrappers v0.5.7.
--
-- Architecture:
--   PostgreSQL → http extension → Upstash REST API → Redis
--
-- Credentials are stored securely in Supabase Vault.
--
-- Prerequisites:
--   1. http extension (enabled)
--   2. supabase_vault extension (already installed)
--   3. An Upstash Redis instance
-- ============================================================

-- ── 1. Enable the http extension ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- ── 2. Create the redis schema ───────────────────────────────
CREATE SCHEMA IF NOT EXISTS redis;

-- ── 3. Store Upstash credentials in Vault ────────────────────
-- Run these manually and note the returned IDs:
--
-- SELECT vault.create_secret(
--   'https://YOUR-HOST.upstash.io',
--   'upstash_redis_url',
--   'Upstash Redis REST API URL'
-- );
--
-- SELECT vault.create_secret(
--   'YOUR_UPSTASH_TOKEN',
--   'upstash_redis_token',
--   'Upstash Redis REST API token'
-- );

-- ══════════════════════════════════════════════════════════════
-- REDIS HELPER FUNCTIONS
-- ══════════════════════════════════════════════════════════════

-- ── redis.urlencode: URL-encode values for REST API ──────────
CREATE OR REPLACE FUNCTION redis.urlencode(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  ch text;
  result text := '';
  i int;
BEGIN
  FOR i IN 1..length(input) LOOP
    ch := substr(input, i, 1);
    IF ch ~ '[A-Za-z0-9_.~-]' THEN
      result := result || ch;
    ELSE
      result := result || '%' || upper(encode(convert_to(ch, 'UTF8'), 'hex'));
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- ── redis.command: Execute any Redis command via REST ─────────
CREATE OR REPLACE FUNCTION redis.command(cmd text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  base_url text;
  token text;
  response extensions.http_response;
  result jsonb;
BEGIN
  SELECT decrypted_secret INTO base_url
    FROM vault.decrypted_secrets WHERE name = 'upstash_redis_url' LIMIT 1;
  SELECT decrypted_secret INTO token
    FROM vault.decrypted_secrets WHERE name = 'upstash_redis_token' LIMIT 1;

  IF base_url IS NULL OR token IS NULL THEN
    RAISE EXCEPTION 'Upstash credentials not found in Vault';
  END IF;

  SELECT * INTO response FROM extensions.http((
    'GET',
    base_url || '/' || cmd,
    ARRAY[extensions.http_header('Authorization', 'Bearer ' || token)],
    NULL,
    NULL
  )::extensions.http_request);

  IF response.status != 200 THEN
    RAISE EXCEPTION 'Redis command failed (HTTP %): %', response.status, response.content;
  END IF;

  result := response.content::jsonb;
  RETURN result->'result';
END;
$$;

-- ── redis.hgetall: Get all fields of a hash ──────────────────
CREATE OR REPLACE FUNCTION redis.hgetall(hash_key text)
RETURNS TABLE(key text, value text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  result jsonb;
  i int;
BEGIN
  result := redis.command('hgetall/' || hash_key);

  IF jsonb_typeof(result) = 'array' AND jsonb_array_length(result) > 0 THEN
    FOR i IN 0 .. (jsonb_array_length(result) / 2 - 1) LOOP
      key := result->>( i * 2 );
      value := result->>( i * 2 + 1 );
      RETURN NEXT;
    END LOOP;
  END IF;
END;
$$;

-- ── redis.hget: Get a single field from a hash ───────────────
CREATE OR REPLACE FUNCTION redis.hget(hash_key text, field text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  result jsonb;
BEGIN
  result := redis.command('hget/' || hash_key || '/' || field);
  RETURN result#>>'{}';
END;
$$;

-- ── redis.hset: Set a field in a hash ────────────────────────
CREATE OR REPLACE FUNCTION redis.hset(hash_key text, field text, val text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('hset/' || redis.urlencode(hash_key) || '/' || redis.urlencode(field) || '/' || redis.urlencode(val));
END;
$$;

-- ── redis.get: Get a string value ────────────────────────────
CREATE OR REPLACE FUNCTION redis.get(redis_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  result jsonb;
BEGIN
  result := redis.command('get/' || redis_key);
  RETURN result#>>'{}';
END;
$$;

-- ── redis.set: Set a string value ────────────────────────────
CREATE OR REPLACE FUNCTION redis.set(redis_key text, val text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('set/' || redis.urlencode(redis_key) || '/' || redis.urlencode(val));
END;
$$;

-- ── redis.setex: Set a string with expiration (seconds) ──────
CREATE OR REPLACE FUNCTION redis.setex(redis_key text, seconds int, val text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('setex/' || redis.urlencode(redis_key) || '/' || seconds::text || '/' || redis.urlencode(val));
END;
$$;

-- ── redis.del: Delete a key ──────────────────────────────────
CREATE OR REPLACE FUNCTION redis.del(redis_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('del/' || redis_key);
END;
$$;

-- ── redis.keys: List keys matching a pattern ─────────────────
CREATE OR REPLACE FUNCTION redis.keys(pattern text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('keys/' || pattern);
END;
$$;

-- ── redis.incr: Increment a counter ─────────────────────────
CREATE OR REPLACE FUNCTION redis.incr(redis_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('incr/' || redis_key);
END;
$$;

-- ── redis.expire: Set TTL on a key (seconds) ─────────────────
CREATE OR REPLACE FUNCTION redis.expire(redis_key text, seconds int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN redis.command('expire/' || redis_key || '/' || seconds::text);
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- CONVENIENCE VIEWS
-- ══════════════════════════════════════════════════════════════

-- SELECT * FROM redis.v_site_settings;
CREATE OR REPLACE VIEW redis.v_site_settings AS
  SELECT * FROM redis.hgetall('site_settings');

-- SELECT * FROM redis.v_tour_cache;
CREATE OR REPLACE VIEW redis.v_tour_cache AS
  SELECT * FROM redis.hgetall('tour_cache');

-- ══════════════════════════════════════════════════════════════
-- SECURITY
-- ══════════════════════════════════════════════════════════════
REVOKE ALL ON SCHEMA redis FROM anon, authenticated;
GRANT USAGE ON SCHEMA redis TO authenticated;

-- Read-only for authenticated users
GRANT EXECUTE ON FUNCTION redis.hgetall(text) TO authenticated;
GRANT EXECUTE ON FUNCTION redis.hget(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION redis.get(text) TO authenticated;

-- Write functions are SECURITY DEFINER only (service_role)
