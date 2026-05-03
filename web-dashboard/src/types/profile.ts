/**
 * Mirrors the `public.profiles` Supabase table row.
 * id is a UUID that matches auth.users.id — the two tables share the same PK.
 */
export interface Profile {
  id:         string;
  full_name:  string | null;
  email:      string | null;
  created_at: string;
  updated_at: string;
}

/** Fields the user is allowed to change on their own profile. */
export type ProfileUpdate = Pick<Profile, "full_name">;
