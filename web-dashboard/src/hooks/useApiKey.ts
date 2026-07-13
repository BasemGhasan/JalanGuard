// 1. Imports — External
import { useState, useEffect, useCallback } from "react";

// 1. Imports — Local
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// 2. Types
/** Lifecycle status of the caller's API key. */
export type ApiKeyStatus = "loading" | "none" | "ready";

interface ApiKeyRow {
  key_public_id: string;
  last_rotated_at: string;
  last_used_at: string | null;
}

interface UseApiKeyReturn {
  /** loading → initial existence check; none → no key yet; ready → a key exists. */
  status: ApiKeyStatus;
  /** Public, non-secret id embedded in the key — safe to show as a masked hint. */
  publicId: string | null;
  /** When the key was last generated/rotated (ISO string), or null. */
  lastRotatedAt: string | null;
  /** Decrypted full key — only present after a reveal/generate this session. */
  plaintext: string | null;
  /** True while the plaintext is shown in cleartext. */
  isRevealed: boolean;
  /** True while any generate/reveal/revoke request is in flight. */
  isBusy: boolean;
  /** Last error message, or null. */
  error: string | null;
  /** Create the first key, or rotate the existing one. Reveals the new value. */
  generate: () => Promise<void>;
  /** Decrypt and reveal the current key (server-side Vault decryption). */
  reveal: () => Promise<void>;
  /** Hide the plaintext again (does not forget it for the session). */
  hide: () => void;
  /** Copy the key to the clipboard, decrypting first if needed. */
  copy: () => Promise<boolean>;
}

/**
 * Encapsulates the API-key lifecycle backed by Supabase Vault.
 *
 * Separation of concerns: every RPC / table call for keys lives here. UI never
 * touches supabase directly. The plaintext key is fetched only on demand via
 * the SECURITY DEFINER `get_api_key` / `generate_api_key` RPCs, so it is never
 * exposed to a plain table read.
 */
export function useApiKey(): UseApiKeyReturn {
  const { session } = useAuth();

  const [status, setStatus] = useState<ApiKeyStatus>("loading");
  const [publicId, setPublicId] = useState<string | null>(null);
  const [lastRotatedAt, setLastRotatedAt] = useState<string | null>(null);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Existence check (no decryption) ───────────────────────────────────────
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      setStatus("none");
      return;
    }

    let cancelled = false;

    const checkKey = async () => {
      setStatus("loading");
      setError(null);

      const { data, error: e } = await supabase
        .from("api_keys")
        .select("key_public_id, last_rotated_at, last_used_at")
        .maybeSingle();

      if (cancelled) return;

      if (e) {
        setError(e.message);
        setStatus("none");
        return;
      }

      const row = data as ApiKeyRow | null;
      if (row) {
        setPublicId(row.key_public_id);
        setLastRotatedAt(row.last_rotated_at);
        setStatus("ready");
      } else {
        setStatus("none");
      }
    };

    void checkKey();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // ── Derive public id + rotation from a freshly issued/decrypted key ────────
  const syncFromPlaintext = useCallback((fullKey: string) => {
    // Format: jg_<public_id>_<secret>
    const parts = fullKey.split("_");
    if (parts.length >= 3) setPublicId(parts[1]);
  }, []);

  // ── Generate / rotate ──────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    const { data, error: e } = await supabase.rpc("generate_api_key");

    setIsBusy(false);

    if (e || typeof data !== "string") {
      setError(e?.message ?? "Failed to generate API key.");
      return;
    }

    setPlaintext(data);
    syncFromPlaintext(data);
    setLastRotatedAt(new Date().toISOString());
    setIsRevealed(true);
    setStatus("ready");
  }, [syncFromPlaintext]);

  // ── Reveal (decrypt) ───────────────────────────────────────────────────────
  const reveal = useCallback(async () => {
    // Already decrypted this session — just unmask.
    if (plaintext) {
      setIsRevealed(true);
      return;
    }

    setIsBusy(true);
    setError(null);

    const { data, error: e } = await supabase.rpc("get_api_key");

    setIsBusy(false);

    if (e || typeof data !== "string") {
      setError(e?.message ?? "Failed to reveal API key.");
      return;
    }

    setPlaintext(data);
    syncFromPlaintext(data);
    setIsRevealed(true);
  }, [plaintext, syncFromPlaintext]);

  // ── Hide ────────────────────────────────────────────────────────────────────
  const hide = useCallback(() => setIsRevealed(false), []);

  // ── Copy (decrypt-on-demand) ────────────────────────────────────────────────
  const copy = useCallback(async (): Promise<boolean> => {
    let value = plaintext;

    if (!value) {
      setIsBusy(true);
      setError(null);
      const { data, error: e } = await supabase.rpc("get_api_key");
      setIsBusy(false);

      if (e || typeof data !== "string") {
        setError(e?.message ?? "Failed to copy API key.");
        return false;
      }
      value = data;
      setPlaintext(data);
      syncFromPlaintext(data);
    }

    await navigator.clipboard.writeText(value);
    return true;
  }, [plaintext, syncFromPlaintext]);

  return {
    status,
    publicId,
    lastRotatedAt,
    plaintext,
    isRevealed,
    isBusy,
    error,
    generate,
    reveal,
    hide,
    copy,
  };
}
