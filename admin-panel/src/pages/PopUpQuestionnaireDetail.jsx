import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Table from "../components/Table";
import toast from "react-hot-toast";

export default function PopUpQuestionnaireDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [questionnaire, setQuestionnaire] = useState(null);
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const token = localStorage.getItem("token");
    const loadDetail = async () => {
        try {
            const res = await api.post(
                "/popup/detail",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuestionnaire(res.data.questionnaire);
            setResults(res.data.results);
        } catch (err) {
            toast.error("Failed to load details");
        }
    };

    useEffect(() => {
        loadDetail();
    }, []);

    if (!questionnaire) return <p>Loading...</p>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
                <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>← Back</button>
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">
                    {questionnaire.title}
                </h2>
                <p>Total Points: {questionnaire.totalPoints}</p>
                <p>Total Questions: {questionnaire.questions.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-3">Questions</h3>
                {questionnaire.questions.map((q, idx) => (
                    <div key={q._id} className="mb-3">
                        <p className="font-medium">
                            {idx + 1}. {q.question}
                        </p>
                        <ul className="ml-5 list-disc">
                            {q.options.map((opt, i) => (
                                <li
                                    key={i}
                                    className={
                                        i === q.correctAnswer
                                            ? "text-green-600 font-medium"
                                            : ""
                                    }
                                >
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-3">
                    User Results
                </h3>
                <Table
                    columns={[
                        {
                            key: "userId.basicInfo.fullName",
                            title: "User Name",
                            render: (_, row) => row.userId?.basicInfo?.fullName || "-"
                        },
                        {
                            key: "userId.basicInfo.email",
                            title: "Email",
                            render: (_, row) => row.userId?.basicInfo?.email || "-"
                        },
                        {
                            key: "correctAnswers",
                            title: "Correct"
                        },
                        {
                            key: "totalQuestions",
                            title: "Total"
                        },
                        {
                            key: "percentage",
                            title: "Percentage",
                            render: (value) =>
                                typeof value === "number" ? `${value.toFixed(2)}%` : "0%"
                        },
                        {
                            key: "pointsEarned",
                            title: "Points Earned"
                        },
                        {
                            title: "View Answers",
                            render: (_, row) => (
                                <button
                                    className="text-blue-600 underline"
                                    onClick={() => setSelectedResult(row)}
                                >
                                    View
                                </button>
                            )
                        },
                        {
                            key: "submittedAt",
                            title: "Submitted At",
                            render: (value) =>
                                value ? new Date(value).toLocaleString() : "-"
                        }
                    ]}
                    data={results}
                />
                {selectedResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
                            <button
                                className="absolute top-2 right-2 text-red-600 text-xl"
                                onClick={() => setSelectedResult(null)}
                            >
                                &times;
                            </button>
                            <h4 className="font-bold mb-2">
                                Answers for {selectedResult.userId?.basicInfo?.fullName}
                            </h4>
                            {selectedResult.answers.map((ans, idx) => (
                                <div key={idx} className="mb-3">
                                    <div>
                                        <strong>Q{ans.questionIndex + 1}:</strong> {ans.question}
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Type: {ans.type}</span>
                                    </div>
                                    {ans.type === "choose" && (
                                        <ul className="ml-5 list-disc">
                                            {ans.options.map((opt, i) => (
                                                <li
                                                    key={i}
                                                    className={
                                                        i === ans.correctAnswer
                                                            ? "text-green-600 font-medium"
                                                            : i === ans.selectedOption
                                                                ? "text-blue-600"
                                                                : ""
                                                    }
                                                >
                                                    {opt}
                                                    {i === ans.selectedOption && " (Selected)"}
                                                    {i === ans.correctAnswer && " (Correct)"}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {ans.type === "input" && (
                                        <div>
                                            <span>
                                                Answer: <b>{ans.inputValue}</b>
                                            </span>
                                            <span className="ml-4 text-green-600">
                                                (Correct: {ans.inputAnswer})
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span
                                            className={
                                                ans.isCorrect
                                                    ? "text-green-600 font-bold"
                                                    : "text-red-600 font-bold"
                                            }
                                        >
                                            {ans.isCorrect ? "Correct" : "Incorrect"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}