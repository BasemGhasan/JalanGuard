import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

/**
 * Hook backing the web dashboard's "Delete Account" action.
 *
 * Unlike mobile, this does NOT always delete the whole login — it calls
 * `delete_web_account`, which only removes developer access (role flag + API
 * key) when the account also has a mobile/citizen side, and only deletes the
 * account outright when there's nothing else to preserve. See the migration
 * `20260721000001_web_account_deletion.sql` for the exact branching.
 *
 * 1. Re-authenticates the user with their current password.
 * 2. Calls `delete_web_account`, which reports which branch it took.
 * 3. Signs the user out either way — there's nothing left for them to do on
 *    the web dashboard once developer access is gone, even if the underlying
 *    account survives.
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

            // 2. Call the RPC — branches on whether a citizen side exists
            const { data: outcome, error: rpcError } = await supabase.rpc("delete_web_account");

            if (rpcError) {
                setError(`Failed to delete account: ${rpcError.message}`);
                setLoading(false);
                return false;
            }

            // 3. Sign out locally regardless of which branch ran
            await supabase.auth.signOut();

            if (outcome === "developer_role_removed") {
                toast.success("Developer access removed.", {
                    description: "Your JalanGuard mobile account is unaffected — sign in from the app any time.",
                });
            } else {
                toast.success("Account permanently deleted.");
            }
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
