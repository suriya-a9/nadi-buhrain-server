import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateTime } from "../dateUtils";

export const generateSingleServiceRequestPDF = async ({ request, logoUrl }) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const loadImage = (url) =>
        new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => resolve(img);
        });

    let logoHeight = 18;
    let logoWidth = 18;
    let logoY = 12;
    let logoX = 14;

    if (logoUrl) {
        const logo = await loadImage(logoUrl);
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1);
        doc.circle(logoX + logoWidth / 2, logoY + logoHeight / 2, logoWidth / 2, "S");
        doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight, undefined, "FAST");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 118, 110);
    doc.text("Nadi Bahrain", logoX + logoWidth + 8, logoY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Service Request Details", logoX + logoWidth + 8, logoY + 20);

    doc.setDrawColor(220);
    doc.line(14, logoY + logoHeight + 8, pageWidth - 14, logoY + logoHeight + 8);

    const details = [
        ["Request ID", request.serviceRequestID || "-"],
        ["Requested By", request.userId?.basicInfo?.fullName || "-"],
        ["Service Name", request.serviceId?.name || "-"],
        ["Issue Name", request.issuesId?.issue || "-"],
        ["Feedback", request.feedback || "-"],
        ["Scheduled Date", formatDateTime(request.scheduleService)],
        ["Is Urgent?", request.immediateAssistance ? "Yes" : "No"],
        ["Status", request.serviceStatus || "-"],
        ["Amount to pay", request.payment ? request.payment : "0"],
    ];

    autoTable(doc, {
        body: details,
        theme: "plain",
        styles: { fontSize: 11, cellPadding: 2 },
        startY: logoY + logoHeight + 14,
        columnStyles: {
            0: { fontStyle: "bold", textColor: [15, 118, 110], cellWidth: 45 },
            1: { cellWidth: 120 }
        }
    });

    if (request.statusTimestamps && Object.keys(request.statusTimestamps).length > 0) {
        autoTable(doc, {
            head: [["Status", "Time"]],
            body: Object.entries(request.statusTimestamps).map(([status, time]) => [
                status,
                time ? formatDateTime(time) : "-"
            ]),
            startY: doc.lastAutoTable.finalY + 6,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [15, 118, 110], textColor: 255 },
        });
    }

    if (request.technicianAssignments && request.technicianAssignments.length > 0) {
        autoTable(doc, {
            head: [
                [
                    "Technician",
                    "Status",
                    "Work Started At",
                    "Work Duration",
                    "Notes",
                    "Spare Parts",
                    "Timeline"
                ]
            ],
            body: request.technicianAssignments.map(a => [
                a.technicianId?.firstName
                    ? `${a.technicianId.firstName} ${a.technicianId.lastName || ""} (${a.technicianId.email || ""})`
                    : a.technicianId,
                a.status,
                a.workDuration != null ? `${Math.floor(a.workDuration / 60)} min` : "-",
                a.usedParts && a.usedParts.length > 0
                    ? a.usedParts.map(
                        part => `${part.productName} x${part.count} (₹${part.price} each, Total: ₹${part.total})`
                    ).join("\n")
                    : "-",
                a.updatedAt ? formatDateTime(a.updatedAt) : "-"
            ]),
            startY: doc.lastAutoTable.finalY + 6,
            styles: { fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [15, 118, 110], textColor: 255 },
        });
    }

    doc.save(`service-request-${request.serviceRequestID || "details"}.pdf`);
};