// 1. Imports — External
import { Fragment } from "react";

// 1. Imports — Local constants
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";

// 2. Interfaces
export interface ExportButtonsProps {
    onExport: (format: "csv" | "excel" | "xml" | "pdf") => Promise<void>;
}

/** The four supported export formats, rendered as separated link buttons. */
const FORMATS = [
    { key: "csv",   label: "CSV" },
    { key: "excel", label: "Excel" },
    { key: "xml",   label: "XML" },
    { key: "pdf",   label: "PDF" },
] as const;

// 3. Component
export function ExportButtons({ onExport }: Readonly<ExportButtonsProps>) {
    return (
        <div style={styles.container}>
            <span style={styles.label}>Export:</span>
            {FORMATS.map(({ key, label }, i) => (
                <Fragment key={key}>
                    {i > 0 && <span style={styles.separator}>|</span>}
                    <button style={styles.linkBtn} onClick={() => onExport(key)}>
                        {label}
                    </button>
                </Fragment>
            ))}
        </div>
    );
}

// 4. Styles
const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        gap: SPACING.sm,
        fontSize: FONT_SIZES.sm + 2,
        marginBottom: SPACING.md,
    },
    label: {
        color: COLORS.textPrimary,
        fontWeight: 700,
        marginRight: SPACING.xs,
    },
    linkBtn: {
        background: "none",
        border: "none",
        color: COLORS.info,
        cursor: "pointer",
        padding: 0,
        fontSize: FONT_SIZES.sm + 2,
        textDecoration: "underline",
    },
    separator: {
        color: COLORS.textMuted,
    },
} as const;
