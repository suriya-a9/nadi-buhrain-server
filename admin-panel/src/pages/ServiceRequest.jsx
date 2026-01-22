import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table";
import api from "../services/api";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";
// function formatDateTime(dateStr) {
//     if (!dateStr) return "-";
//     const d = new Date(dateStr);
//     if (isNaN(d)) return "-";
//     let hours = d.getHours();
//     const minutes = d.getMinutes().toString().padStart(2, "0");
//     const ampm = hours >= 12 ? "pm" : "am";
//     hours = hours % 12 || 12;
//     const day = d.getDate().toString().padStart(2, "0");
//     const month = (d.getMonth() + 1).toString().padStart(2, "0");
//     const year = d.getFullYear();
//     return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
// }

export default function ServiceRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [scheduledDateFilter, setScheduledDateFilter] = useState("");
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    useEffect(() => {
        setCurrentPage(1);
    }, [requests]);
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user-service-list/');
            setRequests(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRequests();
    }, []);
    const filteredRequests = requests.filter(r => {
        const requestId = r.serviceRequestID?.toLowerCase() || "";
        const requestedBy = r.userId?.basicInfo?.fullName?.toLowerCase() || "";
        const status = r.serviceStatus?.toLowerCase() || "";
        const q = search.toLowerCase();

        let dateMatch = true;
        if (scheduledDateFilter && r.scheduleService) {
            const d = new Date(r.scheduleService);
            const filterDate = new Date(scheduledDateFilter);
            dateMatch =
                d.getFullYear() === filterDate.getFullYear() &&
                d.getMonth() === filterDate.getMonth() &&
                d.getDate() === filterDate.getDate();
        }

        return (
            (requestId.includes(q) ||
                requestedBy.includes(q) ||
                status.includes(q)) &&
            dateMatch
        );
    });
    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-[20px] sm:text-[25px] font-bold text-textGreen">
                    New Service Requests
                </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end mb-4">
                <div className="flex flex-col">
                    <label htmlFor="search" className="text-xs font-medium mb-1">Search</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by Request ID, Requested By, or Status"
                        className="border px-3 py-2 rounded w-full sm:w-[200px]"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="scheduled-date" className="text-xs font-medium mb-1">Scheduled Date</label>
                    <input
                        id="scheduled-date"
                        type="date"
                        className="border px-3 py-2 rounded"
                        value={scheduledDateFilter}
                        onChange={e => setScheduledDateFilter(e.target.value)}
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
                                title: "S.Nno",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "Request ID", key: "serviceRequestID" },
                            { title: "Requested By", key: "userId.basicInfo.fullName" },
                            { title: "Service Name", key: "serviceId.name" },
                            { title: "Issue Name", key: "issuesId.issue" },
                            { title: "Feedback", key: "feedback" },
                            {
                                title: "Scheduled Date",
                                key: "scheduleService",
                                render: (_, row) => {
                                    const d = new Date(row.scheduleService);
                                    let dateStr = "-";
                                    if (!isNaN(d)) {
                                        const day = d.getDate().toString().padStart(2, "0");
                                        const month = (d.getMonth() + 1).toString().padStart(2, "0");
                                        const year = d.getFullYear();
                                        dateStr = `${day}/${month}/${year}`;
                                    }
                                    let timeStr = "-";
                                    if (row.scheduleServiceTime && row.scheduleServiceTime !== "-") {
                                        const [h, m] = row.scheduleServiceTime.split(":");
                                        if (!isNaN(h) && !isNaN(m)) {
                                            let hours = parseInt(h, 10);
                                            const minutes = m.padStart(2, "0");
                                            const ampm = hours >= 12 ? "PM" : "AM";
                                            hours = hours % 12 || 12;
                                            timeStr = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
                                        } else {
                                            timeStr = row.scheduleServiceTime;
                                        }
                                    }
                                    return `${dateStr} ${timeStr}`;
                                },
                            },
                            {
                                title: "Is Urgent?",
                                dataIndex: "immediateAssistance",
                                key: "immediateAssistance",
                                render: (value) => (value ? "Yes" : "No"),
                            },
                        ]}
                        data={paginatedRequests}
                        actions={(row) => (
                            <button
                                className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                onClick={() => navigate(`/new-requests/${row._id}`)}
                            >
                                View
                            </button>
                        )}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    )
}