import { AlertCircle } from "lucide-react";
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";

export default function ErrorBanner({ message, style }: { message: string; style?: React.CSSProperties }) {
    return (
        <div style={{ ...Styles.errorBanner, ...style }}>
            <AlertCircle size={15} color={COLORS.error} style={{ flexShrink: 0 }} />
            <span>{message}</span>
        </div>
    );
}

const Styles = {
    errorBanner: {
        display: "flex",
        alignItems: "center",
        gap: SPACING.sm,
        padding: `${SPACING.sm + 2}px ${SPACING.md}px`,
        borderRadius: 12,
        background: COLORS.errorBg,
        border: `1px solid ${COLORS.errorBorder}`,
        color: COLORS.error,
        fontSize: FONT_SIZES.sm + 1,
    }
}