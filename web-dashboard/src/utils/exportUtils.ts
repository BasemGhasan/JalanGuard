import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { HazardWithState } from "../types/map";
import imgToBase64 from "./imgToBase64";
import { COLORS } from "../constants/theme";
import { getDefectTypes, formatDefectType } from "./hazardDisplay";

// ==========================================
// 📊 DATA FORMATTING HELPER
// ==========================================

// 1. Helper: Flatten the data so it exports cleanly (no nested objects)
const formatDataForExport = (data: HazardWithState[]) => {
    return data.map((hazard) => ({
        Type: getDefectTypes(hazard).map(formatDefectType).join(" + ").toUpperCase(),
        Severity: hazard.severity.toUpperCase(),
        Status: hazard.status.toUpperCase(),
        Location: hazard.malaysian_location?.location_name || "Unknown",
        Latitude: hazard.latitude,
        Longitude: hazard.longitude,
        Reporter: hazard.reporter_name || "Anonymous",
        Date: new Date(hazard.created_at).toLocaleDateString(),
    }));
};

// ==========================================
// 📄 EXPORT FUNCTIONS
// ==========================================

export const exportToCSV = (data: HazardWithState[], filename = "jalanguard_data") => {
    const flatData = formatDataForExport(data);
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToExcel = (data: HazardWithState[], filename = "jalanguard_data") => {
    const flatData = formatDataForExport(data);
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hazards");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToXML = (data: HazardWithState[], filename = "jalanguard_data") => {
    const flatData = formatDataForExport(data);

    // Manually build an XML string
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<hazards>\n';
    flatData.forEach((row) => {
        xml += '  <hazard>\n';
        Object.entries(row).forEach(([key, value]) => {
            // Replace spaces in keys for valid XML tags
            const safeKey = key.replace(/\s+/g, "");
            xml += `    <${safeKey}>${value}</${safeKey}>\n`;
        });
        xml += '  </hazard>\n';
    });
    xml += '</hazards>';

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = async (data: HazardWithState[], filename = "jalanguard_data") => {
    const logo = "/assets/images/transparentCircledLogo.PNG";
    const flatData = formatDataForExport(data);
    const doc = new jsPDF();

    // Await the conversion process completely before rendering
    const logoBase64 = await imgToBase64(logo);
    // Safely add the image inline
    doc.addImage(logoBase64, "PNG", 15, 15, 20, 20);

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("JalanGuard Hazard Report", 40, 27);

    // Timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`, 14, 42);

    // Grab the headers from the first object
    const headers = flatData.length > 0 ? Object.keys(flatData[0]) : [];

    // Find the exact indices of the columns that need to be colored
    const statusIndex = headers.indexOf("Status");
    const severityIndex = headers.indexOf("Severity");

    // Convert object data to arrays for autoTable
    const rows = flatData.map((row) => Object.values(row).map(String));

    // Helper for your color logic
    const colorMap: Record<string, string> = {
        ACTIVE: COLORS.info,
        FIXED: COLORS.success,
        HIGH: COLORS.sevHigh,
        MEDIUM: COLORS.sevMedium,
        LOW: COLORS.sevLow,
    };

    // Build the table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }, // A nice blue header
        styles: { fontSize: 8 },
        didParseCell: (data) => {
            // Check if we are in the 'Status' or 'Severity' column
            if (data.section === 'body' && (data.column.index === statusIndex || data.column.index === severityIndex)) {
                const cellValue = data.cell.raw as string;
                const color = colorMap[cellValue.toUpperCase()];
                
                if (color) {
                    data.cell.styles.textColor = color; // Applies the color to text
                    data.cell.styles.fontStyle = 'bold'; // Optional: makes it stand out
                }
            }
        },
        didDrawPage: () => {
            // Define page dimensions (Standard A4 is 210 x 297 mm)
            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();

            // Thick outer border
            doc.setDrawColor(44, 62, 80);
            doc.setLineWidth(1.5);
            doc.rect(10, 10, width - 20, height - 20);

            // Thin inner border
            doc.setLineWidth(0.5);
            doc.rect(11.5, 11.5, width - 23, height - 23);
        },
    });

    doc.save(`${filename}.pdf`);
};