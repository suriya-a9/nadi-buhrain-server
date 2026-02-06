import { useEffect, useState } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function MaterialRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem("token");

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get("/material");
            setRequests(res.data.data || []);
        } catch {
            setRequests([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            const res = await api.post(
                "/material/request-status",
                { id, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadRequests();
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setUpdatingId(null);
        }
    };
    const filteredMaterialRequest = requests.filter(s =>
        (String(s.technicianId?.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.productId?.productName || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.quantity || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.status || "").toLowerCase().includes(search.toLowerCase()))
        &&
        (statusFilter === "" ||
            String(s.status || "").toLowerCase() === statusFilter.toLowerCase())
    );
    const totalPages = Math.ceil(filteredMaterialRequest.length / itemsPerPage);
    const paginatedRequests = filteredMaterialRequest.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Material Requests</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Status</option>
                        <option value="requested">Requested</option>
                        <option value="processed">Processed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search requests"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-48"
                    />
                </div>
            </div>
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
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <div className="mb-2 text-left text-sm text-gray-600">
                        Total no of Requests: {filteredMaterialRequest.length}
                    </div>
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
                            { title: "Quantity", key: "quantity" },
                            { title: "Notes", key: "notes" },
                            { title: "Status", key: "status" },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedRequests}
                        actions={(row) => (
                            <div className="flex gap-2">
                                {row.status !== "processed" && (
                                    <button
                                        disabled={updatingId === row._id}
                                        onClick={() => updateStatus(row._id, "processed")}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        {updatingId === row._id ? "Updating..." : "Process"}
                                    </button>
                                )}
                                {row.status !== "rejected" && (
                                    <button
                                        disabled={updatingId === row._id}
                                        onClick={() => updateStatus(row._id, "rejected")}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        {updatingId === row._id ? "Updating..." : "Reject"}
                                    </button>
                                )}
                            </div>
                        )}
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