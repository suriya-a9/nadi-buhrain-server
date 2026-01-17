import { useEffect, useState } from "react";
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
    const [selected, setSelected] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const [search, setSearch] = useState("");
    const [scheduledDateFilter, setScheduledDateFilter] = useState("");
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
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


    const handleView = (row) => {
        setSelected(row);
        setDetailsOpen(true);
    };

    const handleStatusUpdate = async (id, newStatus, reason) => {
        setStatusUpdating(true);
        try {
            const payload = { id, serviceStatus: newStatus };
            if (newStatus === "rejected" && reason) payload.reason = reason;
            await api.post("/user-service-list/update-status", payload);
            await loadRequests();
            setDetailsOpen(false);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setStatusUpdating(false);
        }
    };

    const renderMedia = (mediaArr = []) => {
        if (!mediaArr.length) return <div className="text-gray-500">No media</div>;
        return (
            <div className="space-y-2">
                {mediaArr.map((file, idx) => {
                    const url = `${API_BASE}/uploads/${file}`;
                    const ext = file.split('.').pop().toLowerCase();
                    if (["mp4", "webm", "ogg"].includes(ext)) {
                        return (
                            <video key={idx} src={url} controls className="w-full max-h-48 rounded" />
                        );
                    }
                    if (["mp3", "wav", "aac"].includes(ext)) {
                        return (
                            <audio key={idx} src={url} controls className="w-full" />
                        );
                    }
                    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
                        return (
                            <img key={idx} src={url} alt={file} className="max-h-40 rounded" />
                        );
                    }
                    return (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                            {file}
                        </a>
                    );
                })}
            </div>
        );
    };

    const statusOptions = [
        "submitted",
        "accepted",
        "technicianAssigned",
        "inProgress",
        "paymentInProgress",
        "completed"
    ];
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
            <Table
                columns={[
                    {
                        title: "s/no",
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
                        render: (value) => formatDateTime(value),
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
                        onClick={() => handleView(row)}
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
            {loading && <div className="text-sm text-gray-500 mt-2">Loading...</div>}

            {detailsOpen && selected && (
                <div className="fixed inset-0 z-50 overflow-auto">
                    <div className="min-h-screen flex items-start justify-center py-8 px-4">
                        <div
                            className="absolute inset-0 bg-black opacity-40"
                            onClick={() => setDetailsOpen(false)}
                        />
                        <div className="relative bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded shadow-lg max-w-2xl w-full z-10 max-h-[90vh] overflow-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Service Request Details</h3>
                                <button
                                    onClick={() => setDetailsOpen(false)}
                                    className="text-sm text-gray-500"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                                <div>
                                    <div className="font-medium">Request ID</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.serviceRequestID}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Requested By</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.userId?.basicInfo?.fullName}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Service Name</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.serviceId?.name}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Issue Name</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.issuesId?.issue}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Feedback</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.feedback}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Scheduled Date</div>
                                    <div className="text-gray-700">{formatDateTime(selected.scheduleService)}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Is Urgent?</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.immediateAssistance ? "Yes" : "No"}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Status</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selected.serviceStatus}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="font-medium mb-2">Media</div>
                                {renderMedia(selected.media)}
                            </div>

                            <div className="mb-4">
                                <div className="font-medium mb-2">Status Timeline</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(selected.statusTimestamps || {}).map(([status, time]) => (
                                        <div key={status}>
                                            <span className="font-medium">{status}:</span>{" "}
                                            <span className="text-gray-700 dark:text-gray-300">{formatDateTime(time)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="font-medium mb-2">Update Status</div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        disabled={statusUpdating || selected.serviceStatus === "accepted"}
                                        className={`px-3 py-1 rounded ${selected.serviceStatus === "accepted"
                                            ? "bg-gray-400 text-white"
                                            : "bg-bgGreen text-white"
                                            }`}
                                        onClick={() => handleStatusUpdate(selected._id, "accepted")}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        disabled={statusUpdating || selected.serviceStatus === "rejected"}
                                        className={`px-3 py-1 rounded ${selected.serviceStatus === "rejected"
                                            ? "bg-gray-400 text-white"
                                            : "bg-red-500 text-white"
                                            }`}
                                        onClick={() => setRejecting(true)}
                                    >
                                        Reject
                                    </button>
                                </div>
                                {rejecting && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                                        <input
                                            type="text"
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            className="border rounded px-2 py-1 w-full mb-2"
                                            placeholder="Enter reason"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1 bg-red-500 text-white rounded"
                                                disabled={statusUpdating || !reason}
                                                onClick={async () => {
                                                    await handleStatusUpdate(selected._id, "rejected", reason);
                                                    setRejecting(false);
                                                    setReason("");
                                                }}
                                            >
                                                Confirm Reject
                                            </button>
                                            <button
                                                className="px-3 py-1 bg-gray-300 text-black rounded"
                                                onClick={() => {
                                                    setRejecting(false);
                                                    setReason("");
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {selected.serviceStatus === "rejected" && selected.reason && (
                                    <div className="mt-2">
                                        <div className="font-medium">Rejection Reason</div>
                                        <div className="text-red-600">{selected.reason}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}