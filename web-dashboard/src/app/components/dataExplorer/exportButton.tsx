import { exportToCSV, exportToExcel, exportToXML, exportToPDF } from "../../../utils/exportUtils";
import type { HazardWithState } from "../../../types/map";
import { COLORS } from "../../../constants/theme";

interface ExportButtonsProps {
    /** The currently filtered array of data from your table */
    data: HazardWithState[];
}

export function ExportButtons({ data }: ExportButtonsProps) {
    return (
        <div style={styles.container}>
            <span style={styles.label}>Export:</span>
            <button style={styles.linkBtn} onClick={() => exportToCSV(data)}>CSV</button>
            <span style={styles.separator}>|</span>
            <button style={styles.linkBtn} onClick={() => exportToExcel(data)}>Excel</button>
            <span style={styles.separator}>|</span>
            <button style={styles.linkBtn} onClick={() => exportToXML(data)}>XML</button>
            <span style={styles.separator}>|</span>
            <button style={styles.linkBtn} onClick={() => exportToPDF(data)}>PDF</button>
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