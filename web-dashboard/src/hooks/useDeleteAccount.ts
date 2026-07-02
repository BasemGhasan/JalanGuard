import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

/**
 * Hook to manage the account deletion process.
 *
 * 1. Re-authenticates the user with their current password.
 * 2. Calls the Supabase RPC function `delete_user` to remove the user from auth.users (cascades to public.profiles).
 * 3. Signs the user out.
 */
export function useDeleteAccount() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async (password: string) => {
    if (!session?.user?.email) {
      setError("No active user session.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify identity by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: password,
      });

      if (signInError) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return false;
      }

      // 2. Call the RPC to delete the account
      const { error: rpcError } = await supabase.rpc("delete_user");

      if (rpcError) {
        setError(`Failed to delete account: ${rpcError.message}`);
        setLoading(false);
        return false;
      }

      // 3. Sign out locally
      await supabase.auth.signOut();
      toast.success("Account permanently deleted.");
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`An unexpected error occurred: ${err.message}`);
      } else {
        setError("An unexpected error occurred.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  return { deleteAccount, loading, error };
}
