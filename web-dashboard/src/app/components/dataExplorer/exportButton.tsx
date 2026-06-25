import { COLORS } from "../../../constants/theme";

export interface ExportButtonsProps {
    onExport: (format: "csv" | "excel" | "xml" | "pdf") => Promise<void>;
}

export function ExportButtons({ onExport }: ExportButtonsProps) {
    return (
        <div style={styles.container}>
            <span style={styles.label}>Export:</span>
            <button style={styles.linkBtn} onClick={() => onExport("csv")}>CSV</button>
            <span style={styles.separator}>|</span>
            <button style={styles.linkBtn} onClick={() => onExport("excel")}>Excel</button>
            <span style={styles.separator}>|</span>
            <button style={styles.linkBtn} onClick={() => onExport("xml")}>XML</button>
            <span style={styles.separator}>|</span>
            <button style={styles.linkBtn} onClick={() => onExport("pdf")}>PDF</button>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontFamily: "sans-serif",
        marginBottom: "16px",
    },
    label: {
        color: COLORS.textPrimary,
        fontWeight: "bold",
        marginRight: "4px",
    },
    linkBtn: {
        background: "none",
        border: "none",
        color: COLORS.info,
        cursor: "pointer",
        padding: 0,
        fontSize: "14px",
        textDecoration: "underline",
    },
    separator: {
        color: COLORS.textMuted,
    },
} as const;