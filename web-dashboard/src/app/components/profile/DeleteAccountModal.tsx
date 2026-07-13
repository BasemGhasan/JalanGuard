// 1. Imports — External
import React, { useState, useCallback, useMemo } from "react";
import { AlertTriangle, X } from "lucide-react";

// 1. Imports — Local components / hooks / constants
import { ModalShell } from "../ui/modalShell";
import { AppButton }  from "../ui/appButton";
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";
import { useDeleteAccount } from "../../../hooks/useDeleteAccount";

// 2. Interfaces
interface DeleteAccountModalProps {
    onClose: () => void;
    onDeleted?: () => void;
}

// 3. Component Definition
export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose, onDeleted }) => {
    const { deleteAccount, loading, error } = useDeleteAccount();
    const [password, setPassword] = useState("");

    // Derived State (useMemo)
    const isSubmitDisabled = useMemo(() => loading || password.length === 0, [loading, password]);

    // Event Handlers (useCallback)
    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const success = await deleteAccount(password);
            if (success) {
                onClose();
                if (onDeleted) onDeleted();
            }
        },
        [deleteAccount, password, onClose, onDeleted]
    );

    return (
        <ModalShell onClose={onClose} labelledBy="delete-account-title" width={480} padded={false}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleRow}>
                    <AlertTriangle size={20} color={COLORS.error} />
                    <h2 id="delete-account-title" style={styles.title}>Delete Account</h2>
                </div>
                <button style={styles.closeBtn} onClick={onClose} disabled={loading} title="Cancel">
                    <X size={18} color={COLORS.textMuted} />
                </button>
            </div>

            {/* Body */}
            <div style={styles.body}>
                <p style={styles.warningText}>
                    Are you sure you want to permanently delete your account? This action cannot be undone, and you will lose access to the Developer Dashboard.
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>To verify your identity, please enter your password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Your password"
                            disabled={loading}
                            style={styles.input}
                            autoFocus
                        />
                    </div>

                    {error && <p style={styles.errorText}>{error}</p>}

                    {/* Footer / Actions */}
                    <div style={styles.actions}>
                        <AppButton variant="outline" type="button" onClick={onClose} disabled={loading}>
                            Cancel
                        </AppButton>
                        <AppButton variant="danger" type="submit" loading={loading} disabled={isSubmitDisabled}>
                            {loading ? "Deleting…" : "Delete Account"}
                        </AppButton>
                    </div>
                </form>
            </div>
        </ModalShell>
    );
};

// 4. Styles
const styles = {
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${SPACING.lg}px ${SPACING.lg}px ${SPACING.sm}px`,
    },
    titleRow: {
        display: "flex",
        alignItems: "center",
        gap: SPACING.sm,
    },
    title: {
        margin: 0,
        fontSize: FONT_SIZES.lg,
        fontWeight: 600,
        color: COLORS.textPrimary,
    },
    closeBtn: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: SPACING.xs,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    body: {
        padding: `${SPACING.sm}px ${SPACING.lg}px ${SPACING.lg}px`,
    },
    warningText: {
        margin: `0 0 ${SPACING.lg}px`,
        color: COLORS.textMuted,
        fontSize: FONT_SIZES.sm + 1,
        lineHeight: 1.5,
    },
    form: {
        display: "flex",
        flexDirection: "column" as const,
        gap: SPACING.md,
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column" as const,
        gap: SPACING.xs,
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: FONT_SIZES.sm + 1,
        fontWeight: 500,
    },
    input: {
        width: "100%",
        padding: `${SPACING.sm}px ${SPACING.md}px`,
        background: COLORS.primary,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 8,
        color: COLORS.textPrimary,
        fontSize: FONT_SIZES.md,
        outline: "none",
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONT_SIZES.sm,
        margin: 0,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
} as const;
