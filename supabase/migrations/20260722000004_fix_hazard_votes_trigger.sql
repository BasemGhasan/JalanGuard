-- ============================================================
-- JalanGuard — Fix: changing an existing vote always failed
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- `hazard_votes` carried a `set_updated_at` BEFORE UPDATE trigger (evidently
-- copy-pasted from the profiles table) but the table has no `updated_at`
-- column, so set_updated_at()'s `NEW.updated_at = now()` raised
--   ERROR 42703: record "new" has no field "updated_at"
-- on every UPDATE.
--
-- voteService.castVote upserts on the unique (hazard_id, user_id) pair, so the
-- conflict path is an UPDATE: a user switching their vote from "fixed" to
-- "broken" (or back) hit this error every time. Only a first-ever vote worked.
--
-- Dropping the trigger rather than adding the column — nothing reads an
-- `updated_at` on a vote, and `created_at` + `vote_type` already carry
-- everything the app needs.
-- ============================================================

DROP TRIGGER IF EXISTS hazard_votes_set_updated_at ON public.hazard_votes;
