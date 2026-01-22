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
                <div>
                    <div className="font-medium">Scheduled Date</div>
                    <div className="text-gray-700">{formatDateTime(request.scheduleService)}</div>
                </div>
                <div>
                    <div className="font-medium">Is Urgent?</div>
                    <div className="text-gray-700">{request.immediateAssistance ? "Yes" : "No"}</div>
                </div>
                <div>
                    <div className="font-medium">Status</div>
                    <div className="text-gray-700">{request.serviceStatus}</div>
                </div>
            </div>
            <div className="mb-4">
                <div className="font-medium mb-2">Media</div>
                {(request.media && request.media.length > 0) ? (
                    <div className="space-y-2">
                        {request.media.map((file, idx) => {
                            const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");
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
                ) : (
                    <div className="text-gray-500">No media</div>
                )}
            </div>
            <div className="mb-4">
                <div className="font-medium mb-2">Voice</div>
                {request.voice ? (
                    (() => {
                        const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");
                        const url = `${API_BASE}/uploads/${request.voice}`;
                        const ext = request.voice.split('.').pop().toLowerCase();
                        return (
                            <audio src={url} controls className="w-full" />
                        );
                    })()
                ) : (
                    <div className="text-gray-500">No voice file</div>
                )}
            </div>
            <div className="mb-4">
                <div className="font-medium mb-2">Status Timeline</div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(request.statusTimestamps || {}).map(([status, time]) => (
                        <div key={status}>
                            <span className="font-medium">{status}:</span>{" "}
                            <span className="text-gray-700">{time ? formatDateTime(time) : "-"}</span>
                        </div>
                    ))}
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