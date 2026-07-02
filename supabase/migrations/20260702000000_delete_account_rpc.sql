-- ============================================================
-- JalanGuard — Delete User RPC
-- ============================================================

-- Function to allow a user to delete their own account.
-- It must run as SECURITY DEFINER to have permissions to delete from auth.users.
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users.
  -- The public.profiles table has an ON DELETE CASCADE foreign key,
  -- so the profile will be automatically deleted as well.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
