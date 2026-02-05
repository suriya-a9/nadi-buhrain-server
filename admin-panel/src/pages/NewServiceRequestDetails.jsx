import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDateTime } from "../utils/dateUtils";

export default function NewServiceRequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");

    useEffect(() => {
        api.get(`/user-service-list/`)
            .then(res => {
                const found = (res.data.data || []).find(r => r._id === id);
                setRequest(found || null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleStatusUpdate = async (newStatus, reason) => {
        setStatusUpdating(true);
        try {
            const payload = { id, serviceStatus: newStatus };
            if (newStatus === "rejected" && reason) payload.reason = reason;
            await api.post("/user-service-list/update-status", payload);
            const res = await api.get(`/user-service-list/`);
            const found = (res.data.data || []).find(r => r._id === id);
            setRequest(found || null);
            setRejecting(false);
            setReason("");
            navigate(-1);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!request) return <div>Request not found</div>;

    return (
        <div className="p-6 bg-white rounded shadow mt-8">
            <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>← Back</button>
            <h2 className="text-[25px] font-bold mb-6 text-textGreen">New Service Request Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                    <div className="font-medium">Request ID</div>
                    <div className="text-gray-700">{request.serviceRequestID}</div>
                </div>
                <div>
                    <div className="font-medium">Requested By</div>
                    <div className="text-gray-700">{request.userId?.basicInfo?.fullName}</div>
                </div>
                <div>
                    <div className="font-medium">Service Name</div>
                    <div className="text-gray-700">{request.serviceId?.name}</div>
                </div>
                <div>
                    <div className="font-medium">Issue Name</div>
                    <div className="text-gray-700">{request.issuesId?.issue}</div>
                </div>
                <div>
                    <div className="font-medium">Feedback</div>
                    <div className="text-gray-700">{request.feedback}</div>
                </div>
                {/* <div>
                    <div className="font-medium">Scheduled Date</div>
                    <div className="text-gray-700">
                        {(() => {
                            const d = new Date(request.scheduleService);
                            let dateStr = "-";
                            if (!isNaN(d)) {
                                const day = d.getDate().toString().padStart(2, "0");
                                const month = (d.getMonth() + 1).toString().padStart(2, "0");
                                const year = d.getFullYear();
                                dateStr = `${day}/${month}/${year}`;
                            }
                            let timeStr = "-";
                            if (request.scheduleServiceTime && request.scheduleServiceTime !== "-") {
                                const [h, m] = request.scheduleServiceTime.split(":");
                                if (!isNaN(h) && !isNaN(m)) {
                                    let hours = parseInt(h, 10);
                                    const minutes = m.padStart(2, "0");
                                    const ampm = hours >= 12 ? "PM" : "AM";
                                    hours = hours % 12 || 12;
                                    timeStr = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
                                } else {
                                    timeStr = request.scheduleServiceTime;
                                }
                            }
                            return `${dateStr} ${timeStr}`;
                        })()}
                    </div>
                </div> */}
                {/* <div>
                    <div className="font-medium">Is Urgent?</div>
                    <div className="text-gray-700">{request.immediateAssistance ? "Yes" : "No"}</div>
                </div> */}
                <div>
                    <div className="font-medium">Status</div>
                    <div className="text-gray-700">{request.serviceStatus}</div>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex flex-wrap gap-6">
                    <div className="flex-1 min-w-[260px] bg-gray-50 rounded-lg shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-textGreen">Media</span>
                            <span className="text-xs text-gray-400">
                                {request.media?.length ? `${request.media.length} file${request.media.length > 1 ? "s" : ""}` : "No media"}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {request.media && request.media.length > 0 ? (
                                request.media.slice(0, 4).map((file, idx) => {
                                    const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");
                                    const url = `${API_BASE}/uploads/${file}`;
                                    const ext = file.split('.').pop().toLowerCase();
                                    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
                                        return (
                                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                                                <img src={url} alt={file} className="w-24 h-24 object-cover rounded border hover:scale-105 transition" />
                                            </a>
                                        );
                                    }
                                    if (["mp4", "webm", "ogg"].includes(ext)) {
                                        return (
                                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                                                <video src={url} className="w-24 h-24 object-cover rounded border" />
                                            </a>
                                        );
                                    }
                                    if (["mp3", "wav", "aac"].includes(ext)) {
                                        return (
                                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                                                <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-600">
                                                    Audio
                                                </div>
                                            </a>
                                        );
                                    }
                                    return (
                                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded border text-xs text-blue-600 underline break-all">
                                            File
                                        </a>
                                    );
                                })
                            ) : (
                                <div className="text-gray-400 text-sm">No media</div>
                            )}
                            {request.media && request.media.length > 4 && (
                                <span className="text-xs text-gray-500 flex items-center">
                                    +{request.media.length - 4} more
                                </span>
                            )}
                        </div>
                        <div className="mt-3">
                            <div className="font-medium text-sm mb-1">Voice</div>
                            {request.voice ? (
                                (() => {
                                    const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");
                                    const url = `${API_BASE}/uploads/${request.voice}`;
                                    return (
                                        <audio src={url} controls className="w-full" />
                                    );
                                })()
                            ) : (
                                <div className="text-gray-400 text-xs">No voice file</div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-[260px] bg-gray-50 rounded-lg shadow-sm p-4">
                        <div className="font-semibold text-textGreen mb-2">Request Timeline</div>
                        <ol className="relative ml-2 flex flex-col gap-5">
                            {(() => {
                                const timelineOrder = [
                                    "submitted",
                                    "accepted",
                                    "technicianAssigned",
                                    "inProgress",
                                    "paymentInProgress",
                                    "completed"
                                ];
                                const statusLabels = {
                                    submitted: "Submitted",
                                    accepted: "Accepted",
                                    technicianAssigned: "Technician Assigned",
                                    inProgress: "In Progress",
                                    paymentInProgress: "Payment In Progress",
                                    completed: "Completed"
                                };
                                const timestamps = request.statusTimestamps || {};
                                return timelineOrder.map((status, idx) => {
                                    const time = timestamps[status];
                                    const isCompleted = !!time;
                                    const isLast = idx === timelineOrder.length - 1;
                                    return (
                                        <li key={status} className="flex items-start relative min-h-[36px]">
                                            {!isLast && (
                                                <span
                                                    className={`absolute left-3 top-6 w-0.5 h-8 ${isCompleted ? "bg-green-400" : "bg-gray-300"} z-0`}
                                                    style={{ minHeight: "24px" }}
                                                ></span>
                                            )}
                                            <span className={`z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5
                                                ${isCompleted ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                                                {isCompleted ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
                                                )}
                                            </span>
                                            <div className="ml-3 flex flex-col">
                                                <span className={`font-medium capitalize text-sm ${isCompleted ? "text-green-700" : "text-gray-700"}`}>{statusLabels[status]}</span>
                                                <span className="text-xs text-gray-500">{time ? formatDateTime(time) : "-"}</span>
                                            </div>
                                        </li>
                                    );
                                });
                            })()}
                        </ol>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <div className="font-medium mb-2">Update Status</div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        disabled={statusUpdating || request.serviceStatus === "accepted"}
                        className={`px-3 py-1 rounded ${request.serviceStatus === "accepted"
                            ? "bg-gray-400 text-white"
                            : "bg-bgGreen text-white"
                            }`}
                        onClick={() => handleStatusUpdate("accepted")}
                    >
                        Accept
                    </button>
                    <button
                        disabled={statusUpdating || request.serviceStatus === "rejected"}
                        className={`px-3 py-1 rounded ${request.serviceStatus === "rejected"
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
                                onClick={() => handleStatusUpdate("rejected", reason)}
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
                {request.serviceStatus === "rejected" && request.reason && (
                    <div className="mt-2">
                        <div className="font-medium">Rejection Reason</div>
                        <div className="text-red-600">{request.reason}</div>
                    </div>
                )}
            </div>
        </div>
    );
}