"""
Email Auth Router
Handles sign-up and password-reset flows that send emails via our own
custom SMTP server instead of Supabase's built-in email delivery.

Flow for sign-up:
  1. Client POSTs { email, password, full_name, redirect_to }
  2. authService creates the user in Supabase (email_confirm: false → no Supabase email)
  3. authService generates a confirmation link via Supabase Admin API
  4. emailService sends that link to the user via custom SMTP
  5. User clicks link → Supabase confirms account → app handles hash redirect

Flow for password-reset:
  1. Client POSTs { email, redirect_to }
  2. authService generates a recovery link via Supabase Admin API
  3. emailService sends that link via custom SMTP
  4. User clicks link → PASSWORD_RECOVERY event fires → app shows reset form
"""

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.services.authService import (
    create_user,
    generate_confirmation_link,
    generate_password_reset_link,
)
from app.services.emailService import (
    send_confirmation_email,
    send_password_reset_email,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Request schemas ──────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email:       EmailStr
    password:    str
    full_name:   str = ""
    redirect_to: str = ""


class ResetPasswordRequest(BaseModel):
    email:       EmailStr
    redirect_to: str = ""


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/email/signup", status_code=status.HTTP_201_CREATED)
async def email_signup(body: SignUpRequest):
    """
    Register a new user and send a confirmation email via custom SMTP.

    The password is forwarded to Supabase so the user can later sign in
    with supabase.auth.signInWithPassword() after confirming their email.
    """
    if len(body.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters.",
        )

    try:
        # Step 1 — create user in Supabase without triggering its email system
        await create_user(
            email=str(body.email),
            password=body.password,
            full_name=body.full_name.strip(),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except RuntimeError as exc:
        logger.error("Supabase config error during signup: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service is not configured correctly. Contact the administrator.",
        )

    try:
        # Step 2 — generate a one-time confirmation link
        action_link = await generate_confirmation_link(
            email=str(body.email),
            redirect_to=body.redirect_to or "",
        )

        # Step 3 — send via our own SMTP
        await send_confirmation_email(
            to_email=str(body.email),
            full_name=body.full_name.strip(),
            action_link=action_link,
        )
    except RuntimeError as exc:
        # SMTP not configured — log and fail with a clear message
        logger.error("SMTP config error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Account created but confirmation email could not be sent: "
                "SMTP is not configured on the server. "
                "Contact the administrator."
            ),
        )
    except Exception as exc:
        # User was created but email failed — still a partial success;
        # log the error but don't expose internal details to the client.
        logger.error("Failed to send confirmation email to %s: %s", body.email, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Account created but the confirmation email could not be delivered. "
                "Please ask an administrator to resend it, or check your spam folder."
            ),
        )

    return {"message": "Account created. Please check your email to confirm your address."}


@router.post("/email/reset-password", status_code=status.HTTP_200_OK)
async def email_reset_password(body: ResetPasswordRequest):
    """
    Send a password-reset email via custom SMTP.

    For security, always returns 200 OK even if the email is not registered
    (prevents email enumeration attacks).
    """
    try:
        action_link = await generate_password_reset_link(
            email=str(body.email),
            redirect_to=body.redirect_to or "",
        )
        await send_password_reset_email(
            to_email=str(body.email),
            action_link=action_link,
        )
    except ValueError:
        # email not found in Supabase — return 200 silently (anti-enumeration)
        pass
    except RuntimeError as exc:
        logger.error("SMTP/Supabase config error during password reset: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service is not configured correctly. Contact the administrator.",
        )
    except Exception as exc:
        logger.error("Failed to send reset email to %s: %s", body.email, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send the reset email. Please try again later.",
        )

    return {"message": "If that address is registered, a reset link has been sent."}
