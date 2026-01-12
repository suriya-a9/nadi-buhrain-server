import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateTime } from "../dateUtils";

const getLastUpdatedStatusWithTime = (statusTimestamps = {}) => {
    const entries = Object.entries(statusTimestamps)
        .filter(([, value]) => value)
        .sort((a, b) => new Date(a[1]) - new Date(b[1]));

    if (!entries.length) return { status: "-", time: "-" };

    const [status, time] = entries[entries.length - 1];
    return { status, time };
};

export const generateServiceRequestsPDF = async ({
    data,
    logoUrl,
    title = "Service Requests Report",
    subtitle
}) => {
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const loadImage = (url) =>
        new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => resolve(img);
        });

    let logoHeight = 20;
    let logoWidth = 20;
    let logoY = 12;
    let logoX = 14;
    let headerY = logoY + logoHeight / 2 + 2;

    if (logoUrl) {
        const logo = await loadImage(logoUrl);
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1);
        doc.circle(logoX + logoWidth / 2, logoY + logoHeight / 2, logoWidth / 2, "S");
        doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight, undefined, "FAST");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110);
    doc.text("Nadi Bahrain", logoX + logoWidth + 8, logoY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(title, logoX + logoWidth + 8, logoY + 20);

    doc.setDrawColor(220);
    doc.line(14, logoY + logoHeight + 8, pageWidth - 14, logoY + logoHeight + 8);

    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(
        subtitle || `Total Records: ${data.length}`,
        14,
        logoY + logoHeight + 16
    );

    const headers = [
        "S/No",
        "Request ID",
        "Requested By",
        "Service",
        "Issue",
        "Urgent",
        "Status",
        "Scheduled",
        "Feedback"
    ];

    const rows = data.map((r, index) => {
        const { status, time } = getLastUpdatedStatusWithTime(r.statusTimestamps);
        return [
            index + 1,
            r.serviceRequestID || "-",
            r.userId?.basicInfo?.fullName || "-",
            r.serviceId?.name || "-",
            r.issuesId?.issue || "-",
            r.immediateAssistance ? "Yes" : "No",
            `${status}${time ? ` (${formatDateTime(time)})` : ""}`,
            formatDateTime(r.scheduleService),
            r.feedback || "-"
        ];
    });

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: logoY + logoHeight + 20,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [15, 118, 110], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawPage: () => {
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(
                `Page ${doc.internal.getNumberOfPages()}`,
                pageWidth - 20,
                doc.internal.pageSize.getHeight() - 10
            );
        }
    });

    doc.save("service-requests-report.pdf");
};