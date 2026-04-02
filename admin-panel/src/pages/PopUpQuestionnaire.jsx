import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function PopUpQuestionnaire() {
    const navigate = useNavigate();
    const [questionnaires, setQuestionnaires] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false); const [accountTypes, setAccountTypes] = useState([]);
    useEffect(() => {
        api.get("/account-type/").then(res => setAccountTypes(res.data.data));
    }, []);

    const [form, setForm] = useState({
        title: "",
        totalPoints: "",
        questions: [],
        targetUserId: ""
    });
    const filteredUsers = users.filter(user => {
        const search = userSearch.toLowerCase();
        return (
            user.basicInfo.fullName.toLowerCase().includes(search) ||
            user.basicInfo.email.toLowerCase().includes(search)
        );
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("token");

    const loadQuestionnaires = async () => {
        setLoading(true);
        const res = await api.get("/popup/list", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setQuestionnaires(res.data.data);
        setLoading(false);
    };

    useEffect(() => {
        loadQuestionnaires();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [questionnaires]);

    const openCreate = () => {
        setEditData(null);
        setForm({
            title: "",
            totalPoints: "",
            questions: [],
            targetUserId: "",
        });
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            title: item.title,
            totalPoints: item.totalPoints,
            questions: item.questions,
            targetUserId: item.targetUserId || [],
        });
        setOpenCanvas(true);
    };
    useEffect(() => {
        api.get("/account-verify/all-user-list")
            .then(res => setUsers(res.data.data))
            .catch(() => setUsers([]));
    }, []);
    const saveQuestionnaire = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (form.targetUserId.length > 0) {
                payload.allowedAccountTypes = [];
            } else {
                payload.targetUserId = [];
            }
            if (editData) payload.id = editData._id;

            await api.post(
                editData ? "/popup/edit" : "/popup/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Saved successfully");
            setOpenCanvas(false);
            loadQuestionnaires();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const deleteQuestionnaire = async (id) => {
        try {
            await api.post(
                "/popup/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Deleted");
            loadQuestionnaires();
        } catch {
            toast.error("Delete failed");
        }
    };

    const addQuestion = () => {
        setForm({
            ...form,
            questions: [
                ...form.questions,
                {
                    question: "",
                    type: "choose",
                    options: ["", ""],
                    correctAnswer: 0,
                    inputAnswer: ""
                }
            ]
        });
    };
    const handleStatus = async (id, status) => {
        setStatusLoading(true);
        try {
            await api.post("/popup/status-change", { id, status: !status });
            toast.success("Status updated");
            loadQuestionnaires();
        } catch (err) {
            toast.error(err.response?.data?.message || "Status update failed");
        }
        setStatusLoading(false);
    };
    const updateQuestion = (index, field, value) => {
        const updated = [...form.questions];
        updated[index][field] = value;

        if (field === "type") {
            if (value === "choose") {
                updated[index].options = ["", ""];
                updated[index].correctAnswer = 0;
                delete updated[index].inputAnswer;
            } else if (value === "input") {
                updated[index].inputAnswer = "";
                delete updated[index].options;
                delete updated[index].correctAnswer;
            }
        }
        setForm({ ...form, questions: updated });
    };

    const removeQuestion = (index) => {
        const updated = [...form.questions];
        updated.splice(index, 1);
        setForm({ ...form, questions: updated });
    };

    const addOption = (qIndex) => {
        const updated = [...form.questions];
        updated[qIndex].options.push("");
        setForm({ ...form, questions: updated });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...form.questions];
        updated[qIndex].options[oIndex] = value;
        setForm({ ...form, questions: updated });
    };

    const removeOption = (qIndex, oIndex) => {
        const updated = [...form.questions];
        updated[qIndex].options.splice(oIndex, 1);
        setForm({ ...form, questions: updated });
    };

    const totalPages = Math.ceil(questionnaires.length / itemsPerPage);
    const paginatedData = questionnaires.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">PopUp</h2>
                <button
                    onClick={openCreate}
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                >
                    Add PopUp
                </button>
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
                        Total no of PopUps: {questionnaires.length}
                    </div>
                    <Table
                        columns={[
                            { title: "S.No", render: (_, __, idx) => idx + 1 },
                            { title: "Title", key: "title" },
                            { title: "Total Points", key: "totalPoints" },
                            {
                                title: "Status",
                                key: "status",
                                render: (val, row) => (
                                    <button
                                        className={`px-3 py-1 rounded ${row.status ? "bg-green-500" : "bg-gray-400"} text-white`}
                                        disabled={statusLoading}
                                        onClick={() => handleStatus(row._id, row.status)}
                                    >
                                        {row.status ? "Active" : "Inactive"}
                                    </button>
                                ),
                            },
                            {
                                title: "Date & Time",
                                key: "createdAt",
                                render: (_, row) => formatDateTime(row.createdAt)
                            },
                        ]}
                        data={paginatedData}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/popup/${row._id}`)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded"
                                >
                                    View
                                </button>

                                <button
                                    onClick={() => openEdit(row)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteQuestionnaire(row._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
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
            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit Popup" : "Add Popup"}
            >
                <form onSubmit={saveQuestionnaire} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Account Types</label>
                        <select
                            value={form.allowedAccountTypes?.[0] || ""}
                            onChange={e => setForm({ ...form, allowedAccountTypes: [e.target.value] })}
                            className="w-full border p-2 rounded"

                        >
                            <option value="">Select Account Type</option>
                            {accountTypes.map(type => (
                                <option key={type._id} value={type._id}>
                                    {type.name_en}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <label className="block mb-1 font-medium">Target User</label>

                        <input
                            type="text"
                            placeholder="Search & select user..."
                            value={
                                form.targetUserId
                                    ? users.find(u => u._id === form.targetUserId)?.basicInfo.fullName || ""
                                    : userSearch
                            }
                            onChange={(e) => {
                                setUserSearch(e.target.value);
                                setShowDropdown(true);
                                setForm({ ...form, targetUserId: "" });
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full border p-2 rounded"
                            disabled={form.allowedAccountTypes?.length > 0}
                        />
                        {form.targetUserId.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {form.targetUserId.map(id => {
                                    const u = users.find(user => user._id === id);
                                    return (
                                        <span
                                            key={id}
                                            className="bg-gray-200 px-2 py-1 rounded flex items-center gap-2"
                                        >
                                            {u?.basicInfo.fullName}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm({
                                                        ...form,
                                                        targetUserId: form.targetUserId.filter(uid => uid !== id)
                                                    })
                                                }
                                                className="text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        {showDropdown && (
                            <div className="absolute z-10 bg-white border w-full max-h-48 overflow-y-auto rounded shadow">
                                <div
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setForm({ ...form, targetUserId: "", allowedAccountTypes: [] });
                                        setUserSearch("");
                                        setShowDropdown(false);
                                    }}
                                >
                                    All Users
                                </div>

                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div
                                            key={user._id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                let updatedList = [...form.targetUserId];

                                                if (!updatedList.includes(user._id)) {
                                                    updatedList.push(user._id);
                                                }

                                                setForm({
                                                    ...form,
                                                    targetUserId: updatedList,
                                                    allowedAccountTypes: []
                                                });

                                                setUserSearch("");
                                                setShowDropdown(false);
                                            }}
                                        >
                                            {user.basicInfo.fullName} ({user.basicInfo.email})
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="font-medium">Title</label>
                        <input
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="font-medium">Total Points</label>
                        <input
                            type="number"
                            value={form.totalPoints}
                            onChange={(e) =>
                                setForm({ ...form, totalPoints: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <hr />

                    {form.questions.map((q, qIndex) => (
                        <div key={qIndex} className="border p-3 rounded space-y-2">
                            <div className="flex justify-between">
                                <strong>Question {qIndex + 1}</strong>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="text-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                            <select
                                value={q.type || "choose"}
                                onChange={e => updateQuestion(qIndex, "type", e.target.value)}
                                className="border p-2 rounded mb-2"
                                required
                            >
                                <option value="choose">Choose</option>
                                <option value="input">Input</option>
                            </select>
                            <input
                                value={q.question}
                                onChange={e => updateQuestion(qIndex, "question", e.target.value)}
                                className="w-full border p-2 rounded"
                                placeholder="Question text"
                                required
                            />
                            {q.type === "choose" ? (
                                <>
                                    {q.options && q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex gap-2">
                                            <input
                                                value={opt}
                                                onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                className="flex-1 border p-2 rounded"
                                                placeholder={`Option ${oIndex + 1}`}
                                                required
                                            />
                                            <input
                                                type="radio"
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(qIndex, oIndex)}
                                                className="text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(qIndex)}
                                        className="text-blue-600 text-sm"
                                    >
                                        + Add Option
                                    </button>
                                </>
                            ) : null}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full bg-gray-200 py-2 rounded"
                    >
                        + Add Question
                    </button>

                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        Save Questionnaire
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}