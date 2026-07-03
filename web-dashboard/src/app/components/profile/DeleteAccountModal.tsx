// 1. Imports
import React, { useState, useCallback, useMemo } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
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
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.titleRow}>
                        <AlertTriangle size={20} color={COLORS.error} />
                        <h2 style={styles.title}>Delete Account</h2>
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
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                style={{
                                    ...styles.deleteBtn,
                                    opacity: isSubmitDisabled ? 0.6 : 1,
                                    cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                                ) : (
                                    "Delete Account"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// 4. Styles
const styles = {
    overlay: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: SPACING.lg,
    },
    modal: {
        background: COLORS.surface,
        borderRadius: 16,
        width: "100%",
        maxWidth: 480,
        border: `1px solid ${COLORS.borderFaint}`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.accentLine}`,
        overflow: "hidden",
    },
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
    cancelBtn: {
        padding: `${SPACING.sm}px ${SPACING.md}px`,
        background: "transparent",
        border: `1px solid ${COLORS.borderSoft}`,
        color: COLORS.textMuted,
        borderRadius: 8,
        fontSize: FONT_SIZES.sm + 1,
        fontWeight: 600,
        cursor: "pointer",
    },
    deleteBtn: {
        display: "flex",
        alignItems: "center",
        gap: SPACING.xs,
        padding: `${SPACING.sm}px ${SPACING.md}px`,
        background: COLORS.error,
        border: "none",
        color: COLORS.white,
        borderRadius: 8,
        fontSize: FONT_SIZES.sm + 1,
        fontWeight: 600,
    },
} as const;
