import { generateServiceRequestsPDF } from "../utils/pdf/serviceRequestsPdf";

export default function PdfButton({ data }) {
    return (
        <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() =>
                generateServiceRequestsPDF({
                    data,
                    logoUrl: "/logo.png"
                })
            }
        >
            Download PDF
        </button>
    );
}