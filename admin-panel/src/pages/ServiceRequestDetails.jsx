import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "../services/api";
import * as XLSX from "xlsx";
import { IoPrintOutline } from "react-icons/io5";
import { formatDateTime } from "../utils/dateUtils";
import { formatDuration } from "../utils/timeUtils";
import Table from "../components/Table";
import { generateSingleServiceRequestPDF } from "../utils/pdf/generateSingleServiceRequestPDF";
import { generateServiceRequestsExcel } from "../utils/excel/serviceRequestsExcel";
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

// function formatDateTime(dateStr) {
//     if (!dateStr) return "-";

//     const d = new Date(dateStr);
//     if (isNaN(d)) return "-";

//     return d.toLocaleString(undefined, {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "numeric",
//         minute: "2-digit",
//         hour12: true
//     });
// }

export default function ServiceRequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [technicians, setTechnicians] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [techWorkStatus, setTechWorkStatus] = useState(null);
    const [techWorkStatusLoading, setTechWorkStatusLoading] = useState(false);
    const [technicianAssignments, setTechnicianAssignments] = useState([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [removingTech, setRemovingTech] = useState(null);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const printBtnRef = useRef(null);
    useEffect(() => {
        if (request?._id) {
            setAssignmentsLoading(true);
            api.get(`/user-service-list/all-technician-assignments/${request._id}`)
                .then(res => setTechnicianAssignments(res.data.assignments || []))
                .catch(() => setTechnicianAssignments([]))
                .finally(() => setAssignmentsLoading(false));
        }
    }, [request]);
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");

    useEffect(() => {
        api.get(`/user-service-list/accpeted-requests`)
            .then(res => {
                const found = (res.data.data || []).find(r => r._id === id);
                setRequest(found || null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (request && !request.technicianId) {
            api.post("/technician/list")
                .then(res => setTechnicians(res.data.data || []))
                .catch(() => setTechnicians([]));
        }
    }, [request]);

    useEffect(() => {
        if (request?.technicianAccepted && request?._id) {
            setTechWorkStatusLoading(true);
            setTechWorkStatus(null);
            api.get(`/user-service-list/technician-work-status/${request._id}`)
                .then(res => setTechWorkStatus(res.data))
                .catch(() => setTechWorkStatus(null))
                .finally(() => setTechWorkStatusLoading(false));
        }
    }, [request]);

    const handleAssignTechnician = async () => {
        if (!selectedTechnician) return;
        setAssigning(true);
        try {
            await api.post("/user-service-list/assign-technician", {
                serviceId: request._id,
                technicianId: selectedTechnician
            });
            const res = await api.get(`/user-service-list/accpeted-requests`);
            const found = (res.data.data || []).find(r => r._id === id);
            setRequest(found || null);
        } catch (err) {
            alert("Failed to assign technician");
        } finally {
            setAssigning(false);
        }
    };
    const handleRemoveTechnician = async () => {
        if (!removingTech) return;
        await api.post("/user-service-list/remove-technician", {
            serviceId: request._id,
            technicianId: removingTech.technicianId._id || removingTech.technicianId
        });
        const res = await api.get(`/user-service-list/all-technician-assignments/${request._id}`);
        setTechnicianAssignments(res.data.assignments || []);
        setRemoveModalOpen(false);
        setRemovingTech(null);
    };
    const renderMedia = (mediaArr = []) => {
        if (!mediaArr?.length) return <div className="text-gray-500">No media</div>;
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

    const excelDetails = [
        {
            "Request ID": request?.serviceRequestID,
            "Requested By": request?.userId?.basicInfo?.fullName,
            "Service Name": request?.serviceId?.name,
            "Issue Name": request?.issuesId?.issue,
            "Feedback": request?.feedback,
            "Scheduled Date": formatDateTime(request?.scheduleService),
            "Is Urgent": request?.immediateAssistance ? "Yes" : "No",
            "Status": request?.serviceStatus,
            "Amount to pay": request?.payment ? request.payment : "0",
        },
    ];

    const excelTimeline = Object.entries(request?.statusTimestamps || {}).map(
        ([status, time]) => ({
            Status: status,
            Time: time ? formatDateTime(time) : "-",
        })
    );

    const excelTechnicians = (technicianAssignments || []).map(a => ({
        Technician: a.technicianId?.firstName
            ? `${a.technicianId.firstName} ${a.technicianId.lastName || ""} (${a.technicianId.email || ""})`
            : a.technicianId,
        Status: a.status,
        "Work Duration": a.workDuration != null ? `${Math.floor(a.workDuration / 60)} min` : "-",
        "Spare Parts": a.usedParts && a.usedParts.length > 0
            ? a.usedParts.map(
                part => `${part.productName} x${part.count} (BHD${part.price} each, Total: BHD${part.total})`
            ).join("; ")
            : "-",
        Timeline: a.updatedAt ? formatDateTime(a.updatedAt) : "-",
        Notes: a.notes || "-",
    }));

    function handleExcelExport() {
        const wb = XLSX.utils.book_new();
        const wsDetails = XLSX.utils.json_to_sheet(excelDetails);
        XLSX.utils.book_append_sheet(wb, wsDetails, "Details");

        if (excelTimeline.length > 0) {
            const wsTimeline = XLSX.utils.json_to_sheet(excelTimeline);
            XLSX.utils.book_append_sheet(wb, wsTimeline, "Status Timeline");
        }

        if (excelTechnicians.length > 0) {
            const wsTechs = XLSX.utils.json_to_sheet(excelTechnicians);
            XLSX.utils.book_append_sheet(wb, wsTechs, "Technicians");
        }

        XLSX.writeFile(wb, `service-request-${request?.serviceRequestID || "details"}.xlsx`);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                printBtnRef.current &&
                !printBtnRef.current.contains(event.target)
            ) {
                setShowExportDropdown(false);
            }
        }
        if (showExportDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportDropdown]);

    if (loading) return <div>Loading...</div>;
    if (!request) return <div>Request not found</div>;

    return (
        <div className="p-6 bg-white rounded shadow mt-8">
            <div className="flex justify-between">
                <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>← Back</button>
                {!loading && request && (
                    <div className="relative" ref={printBtnRef}>
                        <button
                            className="px-4 py-2 bg-bgGreen text-white rounded flex items-center justify-center gap-2"
                            onClick={() => setShowExportDropdown((v) => !v)}
                        >
                            Export <IoPrintOutline size={20} />
                        </button>
                        {showExportDropdown && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => {
                                        generateSingleServiceRequestPDF({
                                            request: { ...request, technicianAssignments },
                                            logoUrl: "/assets/mail-logo.jpg"
                                        });
                                        setShowExportDropdown(false);
                                    }}
                                >
                                    PDF
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => {
                                        handleExcelExport();
                                        setShowExportDropdown(false);
                                    }}
                                >
                                    Excel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <h2 className="text-[25px] font-bold mb-6 text-textGreen">Service Request Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                {/* <div>
                    <div className="font-medium">Assignment ID</div>
                    <div className="text-gray-700">{request._id}</div>
                </div> */}
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
                <div>
                    <div className="font-medium">Assigned Technician(s)</div>
                    <div className="text-gray-700">
                        <div className="mb-4">
                            <div className="font-medium mb-2">Assign Technician(s)</div>
                            <div className="flex gap-2 items-center">
                                <Select
                                    isMulti
                                    options={technicians.map(tech => ({
                                        value: tech._id,
                                        label: `${tech.firstName} ${tech.lastName} (${tech.email})`
                                    }))}
                                    value={technicians
                                        .filter(tech => selectedTechnician.includes(tech._id))
                                        .map(tech => ({
                                            value: tech._id,
                                            label: `${tech.firstName} ${tech.lastName} (${tech.email})`
                                        }))
                                    }
                                    onChange={selected => setSelectedTechnician(selected.map(opt => opt.value))}
                                    className="min-w-[220px] flex-1"
                                    placeholder="Select technician(s)..."
                                />
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded"
                                    disabled={!selectedTechnician.length || assigning}
                                    onClick={async () => {
                                        setAssigning(true);
                                        try {
                                            await api.post("/user-service-list/assign-technician", {
                                                serviceId: request._id,
                                                technicianIds: selectedTechnician
                                            });
                                            const res = await api.get(`/user-service-list/accpeted-requests`);
                                            const found = (res.data.data || []).find(r => r._id === id);
                                            setRequest(found || null);
                                            setSelectedTechnician([]);
                                        } catch (err) {
                                            alert("Failed to assign technician");
                                        } finally {
                                            setAssigning(false);
                                        }
                                    }}
                                >
                                    {assigning ? "Assigning..." : "Assign"}
                                </button>
                            </div>
                        </div>
                        {/* {technicianAssignments.length > 0 && (
                            <div className="mt-2">
                                <div className="font-medium mb-2">Current Assignments</div>
                                <table className="w-full text-sm border">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1">Technician</th>
                                            <th className="border px-2 py-1">Status</th>
                                            <th className="border px-2 py-1">Notes</th>
                                            <th className="border px-2 py-1">Media</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {technicianAssignments.map((a, idx) => (
                                            <tr key={idx}>
                                                <td className="border px-2 py-1">
                                                    {a.technicianId?.firstName
                                                        ? `${a.technicianId.firstName} ${a.technicianId.lastName || ""} (${a.technicianId.email || ""})`
                                                        : a.technicianId}
                                                </td>
                                                <td className="border px-2 py-1 capitalize">{a.status}</td>
                                                <td className="border px-2 py-1">{a.notes || "-"}</td>
                                                <td className="border px-2 py-1">
                                                    {a.media && a.media.length > 0 ? (
                                                        <ul className="list-disc ml-4">
                                                            {a.media.map((file, i) => (
                                                                <li key={i}>
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
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex flex-wrap gap-6">
                    <div className="flex-1 min-w-[260px] bg-gray-50 rounded-lg shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-textGreen">Media</span>
                            <span className="text-xs text-gray-400">
                                {request.media?.length ? `${request.media.length} file${request.media.length > 1 ? "s" : ""}` : "No media"}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {request.media && request.media.length > 0 ? (
                                request.media.slice(0, 4).map((file, idx) => {
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
                                <audio src={`${API_BASE}/uploads/${request.voice}`} controls className="w-full" />
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
                                                <span className="text-xs text-gray-500">
                                                    {time ? formatDateTime(time) : "-"}
                                                    {status === "accepted" && time && request.acceptedBy && (
                                                        <span className="ml-2 text-xs text-gray-700 font-semibold">
                                                            Accepted By: {request.acceptedBy}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                });
                            })()}
                        </ol>
                    </div>
                </div>
            </div>
            <div>
                <div className="font-medium">Amount to pay:</div>
                <div className="text-gray-700">{request.payment ? request.payment : "0"}</div>
            </div>
            <br />
            {!request.technicianId && (
                <div className="mb-4">
                    <div className="font-medium mb-2">Assigned Technicians & Status</div>
                    {assignmentsLoading ? (
                        <div>Loading...</div>
                    ) : technicianAssignments.length === 0 ? (
                        <div className="text-gray-500">No technicians assigned</div>
                    ) : (
                        <>
                            <Table
                                columns={[
                                    {
                                        title: "Technician",
                                        key: "technicianId",
                                        render: (val, row) =>
                                            val?.firstName
                                                ? `${val.firstName} ${val.lastName || ""} (${val.email || ""})`
                                                : val
                                    },
                                    {
                                        title: "Status",
                                        key: "status",
                                        render: (val) => <span className="capitalize">{val}</span>
                                    },
                                    {
                                        title: "Media",
                                        key: "media",
                                        render: (media) =>
                                            media && media.length > 0 ? (
                                                <ul className="list-disc ml-4">
                                                    {media.map((file, i) => (
                                                        <li key={i}>
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
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )
                                    },
                                    {
                                        title: "Work Started At",
                                        key: "workStartedAt",
                                        render: (val) => val ? formatDateTime(val) : "-"
                                    },
                                    {
                                        title: "Work Duration",
                                        key: "workDuration",
                                        render: (val) => val != null ? formatDuration(val) : "-"
                                    },
                                    {
                                        title: "Notes",
                                        key: "notes"
                                    },
                                    {
                                        title: "Spare Parts",
                                        key: "usedParts",
                                        render: (usedParts) =>
                                            usedParts && usedParts.length > 0 ? (
                                                <ul className="list-disc ml-4">
                                                    {usedParts.map((part, i) => (
                                                        <li key={i}>
                                                            {part.productName} x{part.count} (BHD{part.price} each, Total: BHD{part.total})
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )
                                    },
                                    {
                                        title: "Timeline",
                                        key: "updatedAt",
                                        render: (val) => <span className="capitalize">{formatDateTime(val)}</span>
                                    },
                                    {
                                        title: "Actions",
                                        key: "actions",
                                        render: (val, row) => (
                                            <button
                                                className="px-2 py-1 bg-red-500 text-white rounded"
                                                onClick={() => {
                                                    setRemovingTech(row);
                                                    setRemoveModalOpen(true);
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )
                                    }
                                ]}
                                data={technicianAssignments}
                            />
                            {removeModalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                                    <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
                                        <div className="font-bold mb-2">Remove Technician</div>
                                        <div className="mb-4">
                                            Are you sure you want to remove technician <span className="font-semibold">{removingTech?.technicianId?.firstName} {removingTech?.technicianId?.lastName}</span>?
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                className="px-3 py-1 bg-gray-300 rounded"
                                                onClick={() => {
                                                    setRemoveModalOpen(false);
                                                    setRemovingTech(null);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="px-3 py-1 bg-red-500 text-white rounded"
                                                onClick={handleRemoveTechnician}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {request.technicianAccepted === true && (
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
                                                        {part.productName} x{part.count} (BHD{part.price} each, Total: BHD{part.total})
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
    );
}