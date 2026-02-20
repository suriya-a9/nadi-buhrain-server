import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";

export default function SparePartsUsage() {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await api.get("/spare-parts-usage/all-usage");
                setData(res.data.data || []);
            } catch {
                setData([]);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const flatRows = [];
    data.forEach((tech, tIdx) => {
        tech.spareParts.forEach((sp, spIdx) => {
            sp.usage.forEach((usage, uIdx) => {
                flatRows.push({
                    technician: `${tech.technician.firstName || ""} ${tech.technician.lastName || ""}`,
                    technicianEmail: tech.technician.email,
                    product: sp.product.productName,
                    serviceRequestID: usage.userService?.serviceRequestID || "",
                    count: usage.count,
                });
            });
        });
    });

    const filteredRows = flatRows.filter(row =>
        (row.technician || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.technicianEmail || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.product || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.serviceRequestID || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const paginatedRows = filteredRows.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Spare Parts Usage</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-48"
                    />
                    <select
                        value={itemsPerPage}
                        onChange={e => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border p-2 rounded w-28"
                    >
                        <option value={10}>Show 10</option>
                        <option value={50}>Show 50</option>
                        <option value={100}>Show 100</option>
                    </select>
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
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * itemsPerPage + idx + 1,
                            },
                            {
                                title: "Technician",
                                key: "technician"
                            },
                            {
                                title: "Email",
                                key: "technicianEmail"
                            },
                            {
                                title: "Spare Part",
                                key: "product"
                            },
                            {
                                title: "Service Request",
                                key: "serviceRequestID"
                            },
                            {
                                title: "Count",
                                key: "count"
                            }
                        ]}
                        data={paginatedRows}
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
    );
}