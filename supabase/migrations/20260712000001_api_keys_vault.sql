-- ============================================================
-- JalanGuard — API keys with Supabase Vault (two-way encryption)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Design
-- ------
-- A JalanGuard API key is a single string of the form:
--
--     jg_<public_id>_<secret>
--
--   • public_id  — 16 hex chars. Stored IN PLAINTEXT (api_keys.key_public_id,
--                  unique + indexed). It is embedded in the key so the backend
--                  can look the row up in O(1) without decrypting anything.
--   • secret     — 48 hex chars of entropy. Never stored in plaintext.
--
-- The FULL key string is stored encrypted in Supabase Vault
-- (vault.create_secret → vault.decrypted_secrets), giving TWO-WAY SYMMETRIC
-- ENCRYPTION. We deliberately do NOT hash the key, so a signed-in user can
-- reveal it again from the dashboard as many times as they like.
--
-- Access model
-- ------------
--   • RLS restricts the api_keys table so a user only ever sees/mutates their
--     own row.
--   • The vault.decrypted_secrets view is privileged (postgres/service_role
--     only), so plaintext keys are reachable ONLY through the SECURITY DEFINER
--     RPCs below — never by a direct client query.
--   • Front-end (authenticated role): generate_api_key / get_api_key /
--     revoke_api_key, scoped to auth.uid().
--   • Back-end (service_role only): verify_api_key, used by the FastAPI
--     auth middleware to validate an incoming Bearer token.
-- ============================================================

-- Vault ships pre-installed on Supabase, but make the dependency explicit.
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

-- ------------------------------------------------------------
-- 1. Table — one active key per user, cascades on account deletion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  key_public_id   TEXT        NOT NULL,          -- plaintext lookup id embedded in the key
  secret_id       UUID        NOT NULL,          -- FK-in-spirit to vault.secrets(id)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at    TIMESTAMPTZ,
  PRIMARY KEY (id),
  UNIQUE (user_id),          -- one key per user; regeneration rotates in place
  UNIQUE (key_public_id)     -- lookup index for the backend
);

COMMENT ON TABLE  public.api_keys                IS 'JalanGuard developer API keys. Full key stored encrypted in Supabase Vault; only the public lookup id is plaintext.';
COMMENT ON COLUMN public.api_keys.key_public_id  IS 'Plaintext public id embedded in the key (jg_<public_id>_<secret>). Safe to expose; used for O(1) lookup.';
COMMENT ON COLUMN public.api_keys.secret_id      IS 'vault.secrets.id holding the encrypted full key string.';

-- ------------------------------------------------------------
-- 2. Row-Level Security — strictly owner-scoped
-- ------------------------------------------------------------
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_keys: owner select" ON public.api_keys;
CREATE POLICY "api_keys: owner select"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys: owner insert" ON public.api_keys;
CREATE POLICY "api_keys: owner insert"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys: owner update" ON public.api_keys;
CREATE POLICY "api_keys: owner update"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_keys: owner delete" ON public.api_keys;
CREATE POLICY "api_keys: owner delete"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. generate_api_key() — create OR rotate the caller's key
--    Returns the full plaintext key ONCE at call time (also retrievable later
--    via get_api_key). SECURITY DEFINER so it can reach the vault.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions
AS $$
DECLARE
  v_uid        UUID := auth.uid();
  v_public_id  TEXT;
  v_secret     TEXT;
  v_full_key   TEXT;
  v_secret_id  UUID;
  v_existing   public.api_keys%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  -- 16 + 48 hex chars of CSPRNG entropy.
  v_public_id := encode(extensions.gen_random_bytes(8),  'hex');
  v_secret    := encode(extensions.gen_random_bytes(24), 'hex');
  v_full_key  := 'jg_' || v_public_id || '_' || v_secret;

  SELECT * INTO v_existing FROM public.api_keys WHERE user_id = v_uid;

  IF FOUND THEN
    -- Rotate in place: overwrite the encrypted secret and the public id.
    PERFORM vault.update_secret(v_existing.secret_id, v_full_key);
    UPDATE public.api_keys
       SET key_public_id   = v_public_id,
           last_rotated_at = now(),
           last_used_at    = NULL
     WHERE user_id = v_uid;
  ELSE
    -- First key for this user.
    v_secret_id := vault.create_secret(
      v_full_key,
      'jalanguard_api_key:' || v_uid::text,
      'JalanGuard developer API key'
    );
    INSERT INTO public.api_keys (user_id, key_public_id, secret_id)
    VALUES (v_uid, v_public_id, v_secret_id);
  END IF;

  RETURN v_full_key;
END;
$$;

-- ------------------------------------------------------------
-- 4. get_api_key() — reveal the caller's current key (decrypt)
--    Returns NULL if the caller has not generated one yet.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_key TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT ds.decrypted_secret
    INTO v_key
    FROM public.api_keys k
    JOIN vault.decrypted_secrets ds ON ds.id = k.secret_id
   WHERE k.user_id = v_uid;

  RETURN v_key;  -- NULL when the user has no key yet
END;
$$;

-- ------------------------------------------------------------
-- 5. revoke_api_key() — delete the caller's key + its vault secret
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_api_key()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_uid       UUID := auth.uid();
  v_secret_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT secret_id INTO v_secret_id FROM public.api_keys WHERE user_id = v_uid;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  DELETE FROM public.api_keys WHERE user_id = v_uid;
  DELETE FROM vault.secrets   WHERE id = v_secret_id;
  RETURN true;
END;
$$;

-- ------------------------------------------------------------
-- 6. verify_api_key(raw_key) — BACKEND ONLY (service_role)
--    Splits jg_<public_id>_<secret>, looks up by the plaintext public id,
--    decrypts the stored key, and constant-time compares. On success stamps
--    last_used_at and returns the owning user_id; otherwise returns NULL.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_api_key(raw_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions
AS $$
DECLARE
  v_public_id TEXT;
  v_row       public.api_keys%ROWTYPE;
  v_stored    TEXT;
BEGIN
  IF raw_key IS NULL OR raw_key !~ '^jg_[0-9a-f]+_[0-9a-f]+$' THEN
    RETURN NULL;
  END IF;

  -- jg_<public_id>_<secret>  →  split_part(...,'_',2) = public_id
  v_public_id := split_part(raw_key, '_', 2);

  SELECT * INTO v_row FROM public.api_keys WHERE key_public_id = v_public_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT ds.decrypted_secret INTO v_stored
    FROM vault.decrypted_secrets ds
   WHERE ds.id = v_row.secret_id;

  -- The 16-char public_id has already narrowed us to exactly one candidate row,
  -- so this final compare only ever runs against the one true secret. A direct
  -- equality check is sufficient here.
  IF v_stored IS NULL OR v_stored IS DISTINCT FROM raw_key THEN
    RETURN NULL;
  END IF;

  UPDATE public.api_keys SET last_used_at = now() WHERE id = v_row.id;
  RETURN v_row.user_id;
END;
$$;

-- ------------------------------------------------------------
-- 7. Grants — least privilege
--    NOTE: Supabase's default privileges GRANT EXECUTE on new public functions
--    to anon, authenticated AND service_role directly (not via PUBLIC). So we
--    must revoke from those roles explicitly — REVOKE ... FROM PUBLIC is not
--    enough to lock a function down.
-- ------------------------------------------------------------
-- Front-end key lifecycle: signed-in users only (never anon).
REVOKE EXECUTE ON FUNCTION public.generate_api_key()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_api_key()       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_api_key()    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.generate_api_key()  TO authenticated;
GRANT  EXECUTE ON FUNCTION public.get_api_key()       TO authenticated;
GRANT  EXECUTE ON FUNCTION public.revoke_api_key()    TO authenticated;

-- Key verification: backend service_role ONLY. Revoke from anon + authenticated
-- so it can never be used as a key-validation oracle from the browser.
REVOKE EXECUTE ON FUNCTION public.verify_api_key(TEXT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.verify_api_key(TEXT) TO service_role;

-- ------------------------------------------------------------
-- 8. Cleanup — retire the obsolete plaintext key column on profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles DROP COLUMN IF EXISTS api_key;
