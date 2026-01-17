import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";

export default function SpareParts() {
    const [spareParts, setSpareParts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const loadSpareParts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/material/spare-parts");
            setSpareParts(res.data.data || []);
        } catch {
            setSpareParts([]);
        }
        setLoading(false);
    };
    useEffect(() => {
        loadSpareParts();
    }, []);
    const filteredSpareParts = spareParts.filter(s =>
        String(s.technicianId.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
        String(s.productId.productName || "").toLowerCase().includes(search.toLowerCase()) ||
        String(s.count || "").toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredSpareParts.length / ITEMS_PER_PAGE);
    const paginatedSpareParts = filteredSpareParts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Spare Parts</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search spare parts"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-48"
                    />
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <Table
                        columns={[
                            {
                                title: "s/no",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            {
                                title: "Technician",
                                key: "technicianId",
                                render: (tech) =>
                                    tech?.firstName
                                        ? `${tech.firstName} ${tech.lastName || ""}`
                                        : "-"
                            },
                            {
                                title: "Product",
                                key: "productId",
                                render: (prod) => prod?.productName || "-"
                            },
                            { title: "Count", key: "count" },
                            {
                                title: "Timestamp",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedSpareParts}
                    />
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    )
}