import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Table from "../components/Table";
import toast from "react-hot-toast";

export default function QuestionnaireDetail() {
    const { id } = useParams();
    const [questionnaire, setQuestionnaire] = useState(null);
    const [results, setResults] = useState([]);
    const token = localStorage.getItem("token");

    const loadDetail = async () => {
        try {
            const res = await api.post(
                "/questionnaire/detail",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Results:", res.data.results);
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
                            key: "submittedAt",
                            title: "Submitted At",
                            render: (value) =>
                                value ? new Date(value).toLocaleString() : "-"
                        }
                    ]}
                    data={results}
                />
            </div>
        </div>
    );
}