"""
Auth Service — Supabase Admin API
Handles user creation and confirmation/reset link generation via the
Supabase Management REST API using the SERVICE_ROLE key.

Separation of concerns:
  - This module owns the Supabase Admin HTTP calls only.
  - It returns action links; it never sends emails itself.
  - Email transport is the responsibility of emailService.
"""

import os
import httpx

SUPABASE_URL             = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def _admin_headers() -> dict:
    """
    Headers required for Supabase Admin API calls.
    The service-role key bypasses Row Level Security and grants full auth access.
    """
    return {
        "apikey":        SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type":  "application/json",
    }


async def create_user(
    email:     str,
    password:  str,
    full_name: str,
) -> dict:
    """
    Create a new user via the Supabase Admin API.

    `email_confirm` is set to False so Supabase does NOT attempt to send
    its own confirmation email — our emailService handles that instead.

    Returns the created user object or raises ValueError with a human-readable
    message on failure (e.g. duplicate email).
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers=_admin_headers(),
            json={
                "email":         email,
                "password":      password,
                "email_confirm": False,          # ← prevent Supabase from sending its own email
                "user_metadata": {"full_name": full_name},
            },
        )

    data = resp.json()

    if resp.status_code not in (200, 201):
        # Surface the Supabase error message to the caller
        msg = data.get("msg") or data.get("message") or data.get("error_description") or "Failed to create account"
        # Normalise "already registered" messages from different Supabase versions
        if "already" in msg.lower() or resp.status_code == 422:
            raise ValueError("An account with this email address already exists.")
        raise ValueError(msg)

    return data


async def generate_confirmation_link(email: str, redirect_to: str) -> str:
    """
    Generate a one-time email confirmation link via the Supabase Admin API.

    Supabase creates the token and returns the full action_link URL;
    we include it in the email body without Supabase ever sending the email.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/admin/generate_link",
            headers=_admin_headers(),
            json={
                "type":    "signup",
                "email":   email,
                "options": {"redirect_to": redirect_to},
            },
        )

    data = resp.json()

    if resp.status_code != 200:
        msg = data.get("msg") or data.get("message") or "Failed to generate confirmation link"
        raise ValueError(msg)

    action_link: str = data.get("action_link", "")
    if not action_link:
        raise ValueError("Supabase returned an empty confirmation link")

    return action_link


async def generate_password_reset_link(email: str, redirect_to: str) -> str:
    """
    Generate a one-time password-reset (recovery) link via the Supabase Admin API.

    Same principle as generate_confirmation_link — Supabase creates the token,
    we send the link ourselves.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/admin/generate_link",
            headers=_admin_headers(),
            json={
                "type":    "recovery",
                "email":   email,
                "options": {"redirect_to": redirect_to},
            },
        )

    data = resp.json()

    if resp.status_code != 200:
        msg = data.get("msg") or data.get("message") or "Failed to generate reset link"
        raise ValueError(msg)

    action_link: str = data.get("action_link", "")
    if not action_link:
        raise ValueError("Supabase returned an empty reset link")

    return action_link
