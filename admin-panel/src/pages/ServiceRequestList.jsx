import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateServiceRequestsPDF } from "../utils/pdf/serviceRequestsPdf";
import { IoPrintOutline } from "react-icons/io5";
import Table from "../components/Table";
import api from "../services/api";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";
function getLastUpdatedStatusWithTime(statusTimestamps = {}) {
    const entries = Object.entries(statusTimestamps)
        .filter(([, value]) => value)
        .sort((a, b) => new Date(a[1]) - new Date(b[1]));
    if (!entries.length) return { status: "-", time: "-" };
    const [status, time] = entries[entries.length - 1];
    return { status, time };
}
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

export default function ServiceRequestList() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [techWorkStatus, setTechWorkStatus] = useState(null);
    const [techWorkStatusLoading, setTechWorkStatusLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [scheduledDateFilter, setScheduledDateFilter] = useState("");
    const [allAssignments, setAllAssignments] = useState({});
    const rejectedRequests = requests.filter(r => r.technicianAccepted === false && r.technicianId);
    const notAssignedRequests = requests.filter(
        r => (allAssignments[r._id]?.length ?? 0) === 0
    );

    const pendingOrRejectedRequests = requests.filter(r => {
        const assignments = allAssignments[r._id] || [];
        if (!assignments.length) return false;
        return assignments.some(a => a.status === "pending" || a.status === "rejected" || a.status === "on-hold" || a.status === "in-progress") &&
            !assignments.every(a => a.status === "accepted");
    });

    const acceptedRequests = requests.filter(r => {
        const assignments = allAssignments[r._id] || [];
        return assignments.length > 0 && assignments.every(a => a.status === "accepted");
    });

    const technicianCompletedRequests = requests.filter(r => {
        const assignments = allAssignments[r._id] || [];
        return assignments.length > 0 &&
            assignments.every(a => a.status === "completed") &&
            r.serviceStatus === "paymentInProgress";
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);
    useEffect(() => {
        const fetchAssignments = async () => {
            const assignmentsObj = {};
            await Promise.all(
                requests.map(async (req) => {
                    try {
                        const res = await api.get(`/user-service-list/all-technician-assignments/${req._id}`);
                        assignmentsObj[req._id] = res.data.assignments || [];
                    } catch {
                        assignmentsObj[req._id] = [];
                    }
                })
            );
            setAllAssignments(assignmentsObj);
        };
        if (requests.length) fetchAssignments();
    }, [requests]);

    const [search, setSearch] = useState("");
    let tabData = requests;
    if (activeTab === 1) tabData = acceptedRequests;
    if (activeTab === 2) tabData = pendingOrRejectedRequests;
    if (activeTab === 3) tabData = notAssignedRequests;
    if (activeTab === 4) tabData = technicianCompletedRequests;
    const filteredData = tabData.filter(r => {
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
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");
    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user-service-list/accpeted-requests');
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
    useEffect(() => {
        if (detailsOpen && selected && !selected.technicianId) {
            api.post("/technician/list")
                .then(res => setTechnicians(res.data.data || []))
                .catch(() => setTechnicians([]));
        }
    }, [detailsOpen, selected]);
    const handleView = (row) => {
        setSelected(row);
        setDetailsOpen(true);
        setSelectedTechnician("");
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
    const handleAssignTechnician = async () => {
        if (!selectedTechnician.length) return;
        setAssigning(true);
        try {
            await api.post("/user-service-list/assign-technician", {
                serviceId: selected._id,
                technicianIds: selectedTechnician
            });
            await loadRequests();
            setDetailsOpen(false);
        } catch (err) {
            alert("Failed to assign technician");
        } finally {
            setAssigning(false);
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
    const StatusDropdown = ({ statusTimestamps = {} }) => {
        const lastStatus = getLastUpdatedStatus(statusTimestamps);

        return (
            <select
                className="border rounded px-2 py-1 text-sm bg-gray-100 cursor-pointer"
                value={lastStatus}
                onChange={() => { }}
            >
                {Object.entries(statusTimestamps).map(([status, time]) => (
                    <option key={status} value={status}>
                        {status} {time ? `(${time})` : ""}
                    </option>
                ))}
            </select>
        );
    };
    useEffect(() => {
        if (detailsOpen && selected?.technicianAccepted && selected?._id) {
            setTechWorkStatusLoading(true);
            setTechWorkStatus(null);
            api.get(`/user-service-list/technician-work-status/${selected._id}`)
                .then(res => setTechWorkStatus(res.data))
                .catch(() => setTechWorkStatus(null))
                .finally(() => setTechWorkStatusLoading(false));
        }
    }, [detailsOpen, selected]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-[20px] sm:text-[25px] font-bold text-textGreen">Service Requests List</h2>
                <button
                    className="px-4 py-2 bg-bgGreen text-white rounded flex items-center justify-center gap-2 w-full sm:w-auto"
                    onClick={() =>
                        generateServiceRequestsPDF({
                            data: filteredData,
                            logoUrl: "/assets/mail-logo.jpg",
                            subtitle: `Total Records: ${filteredData.length}`
                        })
                    }
                >
                    PDF <IoPrintOutline size={20} />
                </button>
            </div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                <button
                    className={`px-4 py-2 rounded ${activeTab === 0 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab(0)}
                >
                    All
                </button>

                <button
                    className={`px-4 py-2 rounded ${activeTab === 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab(1)}
                >
                    Technician Accepted
                </button>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab(2)}
                >
                    Technician Pending / Rejected
                </button>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab(3)}
                >
                    Technician Not Assigned
                </button>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 4 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab(4)}
                >
                    Technician Completed
                </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                <h2 className="text-2xl font-semibold">Service Requests List</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
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
                            {
                                title: "Is Urgent?",
                                dataIndex: "immediateAssistance",
                                key: "immediateAssistance",
                                render: (value) => (value ? "Yes" : "No"),
                            },
                            {
                                title: "Status",
                                key: "statusTimestamps",
                                render: (_, row) => {
                                    const { status, time } = getLastUpdatedStatusWithTime(row.statusTimestamps);
                                    return (
                                        <span>
                                            {status} {time && time !== "-" ? `(${formatDateTime(time)})` : ""}
                                        </span>
                                    );
                                },
                            },
                        ]}
                        data={paginatedData}
                        actions={(row) => (
                            <button
                                className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                onClick={() => navigate(`/service-requests/${row._id}`)}
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
            {paginatedData.length === 0 && (
                <div className="text-center text-gray-500 mt-4">No requests in this category.</div>
            )}
            {detailsOpen && selected && (
                <div className="fixed inset-0 z-50 overflow-auto">
                    <div className="min-h-screen flex items-start justify-center py-8 px-4">
                        <div
                            className="absolute inset-0 bg-black opacity-40"
                            onClick={() => setDetailsOpen(false)}
                        />
                        <div className="relative bg-white text-black p-6 rounded shadow-lg max-w-2xl w-full z-10 max-h-[90vh] overflow-auto">
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
                                    <div className="text-gray-700">{selected.serviceRequestID}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Requested By</div>
                                    <div className="text-gray-700">{selected.userId?.basicInfo?.fullName}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Service Name</div>
                                    <div className="text-gray-700">{selected.serviceId?.name}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Issue Name</div>
                                    <div className="text-gray-700">{selected.issuesId?.issue}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Feedback</div>
                                    <div className="text-gray-700">{selected.feedback}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Scheduled Date</div>
                                    <div className="text-gray-700">{selected.scheduleService}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Is Urgent?</div>
                                    <div className="text-gray-700">{selected.immediateAssistance ? "Yes" : "No"}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Status</div>
                                    <div className="text-gray-700">{selected.serviceStatus}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Assigned Technician</div>
                                    <div className="text-gray-700">
                                        {selected.technicianId
                                            ? (selected.technicianId.firstName
                                                ? `${selected.technicianId.firstName} ${selected.technicianId.lastName || ""} (${selected.technicianId.email || ""})`
                                                : selected.technicianId)
                                            : "Not Assigned"}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">Technician Assignment Status</div>
                                    <div className="text-gray-700">
                                        {selected.technicianAccepted === true
                                            ? "Accepted"
                                            : selected.technicianId
                                                ? "Pending"
                                                : "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="font-medium mb-2">Media</div>
                                {renderMedia(selected.media)}
                            </div>

                            <div className="mb-4">
                                <div className="font-medium mb-2">Status Timeline</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(selected.statusTimestamps || {}).map(([status, time]) => (
                                        <div key={status}>
                                            <span className="font-medium">{status}:</span>{" "}
                                            <span className="text-gray-700">{time || "-"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!selected.technicianId && (
                                <div className="mb-4">
                                    <div className="font-medium mb-2">Assign Technician(s)</div>
                                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                        <select
                                            className="border rounded px-2 py-1 w-full sm:w-[220px] min-h-[80px]"
                                            multiple
                                            value={selectedTechnician}
                                            onChange={e => {
                                                const options = Array.from(e.target.selectedOptions, opt => opt.value);
                                                setSelectedTechnician(options);
                                            }}
                                        >
                                            {technicians.map(tech => (
                                                <option key={tech._id} value={tech._id}>
                                                    {tech.firstName} {tech.lastName} ({tech.email})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="px-3 py-1 bg-blue-600 text-white rounded"
                                            disabled={!selectedTechnician.length || assigning}
                                            onClick={handleAssignTechnician}
                                        >
                                            {assigning ? "Assigning..." : "Assign"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {selected.technicianAccepted === true && (
                                <div className="mb-4">
                                    <div className="font-medium">Technician Work Status</div>
                                    <div className="text-gray-700">
                                        {techWorkStatusLoading
                                            ? "Loading..."
                                            : techWorkStatus
                                                ? <>
                                                    <div>
                                                        <span className="capitalize font-semibold">{techWorkStatus.status}</span>
                                                        {techWorkStatus.notes && (
                                                            <div className="text-xs text-gray-500 mt-1">Notes: {techWorkStatus.notes}</div>
                                                        )}
                                                    </div>
                                                    {techWorkStatus.media && techWorkStatus.media.length > 0 && (
                                                        <div className="mt-2">
                                                            <div className="font-medium">Technician Media</div>
                                                            <ul className="list-disc ml-4">
                                                                {techWorkStatus.media.map((file, idx) => (
                                                                    <li key={idx}>
                                                                        <a
                                                                            href={`${API_BASE}/uploads/${file}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 underline"
                                                                        >
                                                                            {file}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {techWorkStatus.usedParts && techWorkStatus.usedParts.length > 0 && (
                                                        <div className="mt-2">
                                                            <div className="font-medium">Used Parts</div>
                                                            <ul className="list-disc ml-4">
                                                                {techWorkStatus.usedParts.map((part, idx) => (
                                                                    <li key={idx}>
                                                                        {part.productName} x{part.count} (₹{part.price} each, Total: ₹{part.total})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {techWorkStatus.workStartedAt && (
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            Work Started At: {new Date(techWorkStatus.workStartedAt).toLocaleString()}
                                                        </div>
                                                    )}
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Work Duration: {techWorkStatus.workDuration ? `${Math.floor(techWorkStatus.workDuration / 60)} min` : "N/A"}
                                                    </div>
                                                </>
                                                : "Not available"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}