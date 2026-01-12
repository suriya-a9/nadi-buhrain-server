import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function Questionnaire() {
    const navigate = useNavigate();
    const [questionnaires, setQuestionnaires] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);

    const [form, setForm] = useState({
        title: "",
        totalPoints: "",
        questions: []
    });

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("token");

    const loadQuestionnaires = async () => {
        const res = await api.get("/questionnaire/list", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setQuestionnaires(res.data.data);
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
            questions: []
        });
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            title: item.title,
            totalPoints: item.totalPoints,
            questions: item.questions
        });
        setOpenCanvas(true);
    };

    const saveQuestionnaire = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (editData) payload.id = editData._id;

            await api.post(
                editData ? "/questionnaire/edit" : "/questionnaire/add",
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
                "/questionnaire/delete",
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
                    options: ["", ""],
                    correctAnswer: 0
                }
            ]
        });
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...form.questions];
        updated[index][field] = value;
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

    const totalPages = Math.ceil(questionnaires.length / ITEMS_PER_PAGE);
    const paginatedData = questionnaires.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Questionnaires</h2>
                <button
                    onClick={openCreate}
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                >
                    Add Questionnaire
                </button>
            </div>

            <Table
                columns={[
                    { title: "S/No", render: (_, __, idx) => idx + 1 },
                    { title: "Title", key: "title" },
                    { title: "Total Points", key: "totalPoints" },
                    {
                        title: "Timestamp",
                        key: "createdAt",
                        render: (_, row) => formatDateTime(row.createdAt)
                    },
                ]}
                data={paginatedData}
                actions={(row) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/questionnaire/${row._id}`)}
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

            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit Questionnaire" : "Add Questionnaire"}
            >
                <form onSubmit={saveQuestionnaire} className="space-y-4">
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

                            <input
                                value={q.question}
                                onChange={(e) =>
                                    updateQuestion(qIndex, "question", e.target.value)
                                }
                                className="w-full border p-2 rounded"
                                placeholder="Question text"
                                required
                            />

                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex gap-2">
                                    <input
                                        value={opt}
                                        onChange={(e) =>
                                            updateOption(qIndex, oIndex, e.target.value)
                                        }
                                        className="flex-1 border p-2 rounded"
                                        placeholder={`Option ${oIndex + 1}`}
                                        required
                                    />
                                    <input
                                        type="radio"
                                        checked={q.correctAnswer === oIndex}
                                        onChange={() =>
                                            updateQuestion(qIndex, "correctAnswer", oIndex)
                                        }
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
    );
}