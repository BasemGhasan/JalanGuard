"""
Email Service — Custom SMTP
Sends transactional auth emails (confirmation, password reset) via the
SMTP credentials configured in Settings. Completely bypasses Supabase's
built-in email delivery pipeline.

Separation of concerns:
  - This module owns ONLY the transport layer (SMTP connection + send).
  - HTML template building is also here because it is purely presentation
    data with no business logic.
  - The authService layer decides WHAT to send; this module decides HOW.
"""

import smtplib
import ssl
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


# ── HTML email template ───────────────────────────────────────────────────────

_HTML_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>JalanGuard</title>
</head>
<body style="margin:0;padding:0;background:#0B0F19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#0B0F19;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0"
               style="background:#1E293B;border-radius:16px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;max-width:480px;width:100%%;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#D97706;">JalanGuard</h1>
              <p style="margin:4px 0 0;font-size:11px;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;">
                Open Road Safety Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#FFFFFF;">{title}</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#94A3B8;line-height:1.6;">{body}</p>

              <div style="text-align:center;margin:32px 0;">
                <a href="{action_link}"
                   style="display:inline-block;background:#D97706;color:#FFFFFF;text-decoration:none;
                          padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">
                  {button_text}
                </a>
              </div>

              <p style="margin:24px 0 0;font-size:12px;color:#64748B;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{action_link}"
                   style="color:#D97706;word-break:break-all;font-size:11px;">{action_link}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748B;">
                This link expires in 24 hours.
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#475569;">
                &copy; 2026 JalanGuard &mdash; Jalan Selamat, Malaysia Maju
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _build_html(title: str, body: str, action_link: str, button_text: str) -> str:
    """Render the email HTML template with the supplied parameters."""
    return _HTML_TEMPLATE.format(
        title=title,
        body=body,
        action_link=action_link,
        button_text=button_text,
    )


# ── Transport ─────────────────────────────────────────────────────────────────

def _send_sync(to_email: str, subject: str, html_body: str) -> None:
    """
    Synchronous SMTP send.

    Automatically selects the correct connection mode:
      port 465  → SMTP_SSL  (SSL from the start)
      any other → SMTP + STARTTLS  (port 587 is the common choice)

    Called via run_in_executor so it never blocks the async event loop.
    """
    if not settings.SMTP_HOST:
        raise RuntimeError(
            "SMTP is not configured. "
            "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM "
            "as Replit Secrets (or in backend/.env for local dev)."
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = settings.SMTP_FROM
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    context = ssl.create_default_context()

    if settings.SMTP_PORT == 465:
        # Direct SSL connection (implicit TLS)
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT,
                               context=context, timeout=15) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
    else:
        # STARTTLS — upgrades a plain connection to encrypted (port 587 typical)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT,
                          timeout=15) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())


async def send_confirmation_email(to_email: str, full_name: str, action_link: str) -> None:
    """
    Send the account-confirmation email after sign-up.
    The action_link is generated by the Supabase Admin API and contains
    a one-time token — we only handle the transport here.
    """
    name_part = f"Hi {full_name}, " if full_name else ""
    html = _build_html(
        title="Confirm your email address",
        body=(
            f"{name_part}welcome to JalanGuard! "
            "Please confirm your email address to activate your developer account "
            "and gain access to the API."
        ),
        action_link=action_link,
        button_text="Confirm Email Address",
    )
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(
        None, _send_sync, to_email, "Confirm your JalanGuard account", html
    )


async def send_password_reset_email(to_email: str, action_link: str) -> None:
    """
    Send the password-reset email.
    The action_link is a Supabase Admin-generated recovery link.
    """
    html = _build_html(
        title="Reset your password",
        body=(
            "We received a request to reset the password for your JalanGuard account. "
            "Click the button below to set a new password. "
            "This link is valid for 24 hours."
        ),
        action_link=action_link,
        button_text="Reset Password",
    )
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(
        None, _send_sync, to_email, "Reset your JalanGuard password", html
    )
