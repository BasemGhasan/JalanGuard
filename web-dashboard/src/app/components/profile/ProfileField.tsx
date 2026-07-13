import { useState } from "react";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";
import { toast } from "sonner";
import type { ChangeEvent, ElementType, ReactNode } from "react";

interface ProfileFieldProps {
  readonly icon: ElementType;
  readonly label: string;
  readonly value: string;
  readonly editable?: boolean;
  readonly editing?: boolean;
  readonly badge?: ReactNode;
  readonly isEmailUpdate?: boolean;
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onSave?: (newValue: string) => Promise<void>;
  readonly onRequestOtp?: (newEmail: string) => Promise<void>;
  readonly onVerifyOtp?: (newEmail: string, otpCode: string) => Promise<void>;
}

function parseOtpOrTokenHash(raw: string): { token?: string; tokenHash?: string } {
  const input = raw.trim();

  // Accept full confirmation links by extracting token fields from either query or hash.
  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const url = new URL(input);
      const fromQuery = url.searchParams.get("token") || url.searchParams.get("token_hash");
      if (fromQuery) {
        return url.searchParams.has("token_hash")
          ? { tokenHash: fromQuery }
          : { token: fromQuery };
      }

      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const fromHash = hashParams.get("token") || hashParams.get("token_hash");
      if (fromHash) {
        return hashParams.has("token_hash")
          ? { tokenHash: fromHash }
          : { token: fromHash };
      }
    } catch {
      // Fall through to plain token handling.
    }
  }

  return input.includes(".") ? { tokenHash: input } : { token: input };
}

export function ProfileField({
  icon: Icon,
  label,
  value,
  editable,
  editing,
  badge,
  isEmailUpdate,
  onChange,
  onSave,
  onRequestOtp,
  onVerifyOtp,
}: ProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Two-step OTP State
  const [isWaitingForOtp, setIsWaitingForOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const isControlledEditing = typeof editing === "boolean";
  const isCurrentlyEditing = isControlledEditing ? editing : isEditing;

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(value);
    setIsWaitingForOtp(false);
    setOtpCode("");
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setIsWaitingForOtp(false);
    setOtpCode("");
  };

  const handleActionClick = async () => {
    if (!editValue.trim() || editValue === value) {
      handleCancelClick();
      return;
    }

    setLoading(true);

    try {
      // Flow A: Email Two-Step Update
      if (isEmailUpdate && onRequestOtp && onVerifyOtp) {
        if (isWaitingForOtp) {
          if (!otpCode.trim()) {
            toast.error("Enter the OTP code or paste the confirmation link.");
            return;
          }

          const parsed = parseOtpOrTokenHash(otpCode);
          await onVerifyOtp(editValue.trim(), parsed.tokenHash ?? parsed.token ?? "");
          toast.success("Email updated successfully!");
          setIsEditing(false);
          setIsWaitingForOtp(false);
        } else {
          await onRequestOtp(editValue.trim());
          toast.success("Verification email sent to the new address.");
          setIsWaitingForOtp(true);
        }
      }
      // Flow B: Standard One-Step Update (e.g., Full Name)
      else if (onSave) {
        await onSave(editValue.trim());
        toast.success(`${label} updated successfully!`);
        setIsEditing(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || `Failed to update ${label.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.row}>
      <div style={styles.iconWrap}>
        <Icon size={20} color={COLORS.secondary} />
      </div>

      <div style={styles.textWrap}>
        <div style={styles.labelRow}>
          <span style={styles.label}>{label}</span>
          {badge}
        </div>

        {isCurrentlyEditing ? (
          <div style={styles.editGroup}>
            <input
              type={isEmailUpdate ? "email" : "text"}
              value={editValue}
              onChange={isControlledEditing ? onChange : (e) => setEditValue(e.target.value)}
              disabled={loading || isWaitingForOtp}
              style={styles.input}
              placeholder={`Enter new ${label.toLowerCase()}`}
            />
            {/* Renders OTP input only if Phase 1 succeeded */}
            {isWaitingForOtp && (
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={loading}
                style={{ ...styles.input, marginTop: 8 }}
                placeholder="Enter OTP code or paste confirmation link"
              />
            )}
          </div>
        ) : (
          <span style={styles.value}>{value || "Not set"}</span>
        )}
      </div>

      {editable && !isControlledEditing && (
        <div style={styles.actions}>
          {isCurrentlyEditing ? (
            <>
              <button style={styles.actionBtn} onClick={handleActionClick} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} color={COLORS.success} />}
              </button>
              <button style={styles.actionBtn} onClick={handleCancelClick} disabled={loading}>
                <X size={16} color={COLORS.error} />
              </button>
            </>
          ) : (
            <button style={styles.actionBtn} onClick={handleEditClick}>
              <Edit2 size={16} color={COLORS.textMuted} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    padding: `${SPACING.sm}px 0`,
    borderBottom: `1px solid ${COLORS.borderFaint}`,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: COLORS.glintFaint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  textWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginBottom: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 500,
  },
  editGroup: {
    display: "flex",
    flexDirection: "column" as const,
    paddingRight: SPACING.md,
  },
  input: {
    background: COLORS.background,
    border: `1px solid ${COLORS.borderSoft}`,
    borderRadius: 8,
    color: COLORS.textPrimary,
    padding: "8px 12px",
    fontSize: FONT_SIZES.md,
    outline: "none",
  },
  actions: {
    display: "flex",
    gap: SPACING.sm,
  },
  actionBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  }
} as const;