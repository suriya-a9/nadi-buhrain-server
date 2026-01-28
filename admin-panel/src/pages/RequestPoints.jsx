import { useEffect, useState } from "react";
import api from "../services/api";
import Table from "../components/Table";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";
import Pagination from "../components/Pagination";

export default function RequestPoints() {
    const [requests, setRequests] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        loadRequests();
        loadQuestionnaires();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get("/points/listRequestToAdmin", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.data);
        } catch (err) {
            toast.error("Failed to load requests");
        }
        setLoading(false);
    };

    const loadQuestionnaires = async () => {
        try {
            const res = await api.get("/Questionnaire/list");
            setQuestionnaires(res.data.data);
        } catch (err) {
            toast.error("Failed to load questionnaires");
        }
    };

    const handleAction = async (requestId, actionType, questionnaireId = null) => {
        try {
            await api.post(
                "/points/adminRequestAction",
                { requestId, actionType, questionnaireId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Action updated");
            loadRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update action");
        }
    };
    const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
    const paginatedRequests = requests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <h2 className="text-[20px] sm:text-[25px] font-bold text-textGreen mb-4">
                Requests
            </h2>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <div className="mb-2 text-left text-sm text-gray-600">
                        Total no of Requests: {requests.length}
                    </div>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "User", key: "userId", render: (user) => user?.basicInfo?.fullName || "-" },
                            { title: "Points", key: "points" },
                            { title: "Reason", key: "reason" },
                            { title: "Status", key: "status" },
                            {
                                title: "Actions",
                                key: "actions",
                                render: (_, row) => {
                                    const actionTaken = !!row.actionType;
                                    return (
                                        <div className="flex gap-2">
                                            <button
                                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                                onClick={() => handleAction(row._id, "raise_payment")}
                                                disabled={actionTaken}
                                            >
                                                Raise Payment
                                            </button>
                                            <select
                                                className="border px-2 py-1 rounded"
                                                onChange={e => {
                                                    if (e.target.value)
                                                        handleAction(row._id, "send_questionnaire", e.target.value);
                                                }}
                                                disabled={actionTaken}
                                                defaultValue=""
                                            >
                                                <option value="">Send Questionnaire</option>
                                                {questionnaires.map(q => (
                                                    <option key={q._id} value={q._id}>{q.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                }
                            },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedRequests}
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