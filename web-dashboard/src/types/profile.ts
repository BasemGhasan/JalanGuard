/**
 * Mirrors the `public.profiles` Supabase table row.
 * id is a UUID that matches auth.users.id — the two tables share the same PK.
 */
export interface Profile {
  id:           string;
  full_name:    string | null;
  email:        string | null;
  /** Has a mobile citizen-reporting account. Read-only from the client. */
  is_citizen:   boolean;
  /** Has a web developer-dashboard account. Read-only from the client. */
  is_developer: boolean;
  created_at:   string;
  updated_at:   string;
}

