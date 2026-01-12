import { useEffect, useState } from "react";
import Table from "../components/Table";
import api from "../services/api";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");
    useEffect(() => {
        setCurrentPage(1);
    }, [logs]);
    const token = localStorage.getItem("token");
    const { role } = useAuth();
    const loadLogs = async () => {
        let res;
        if (role === "Super Admin") {
            res = await api.get(
                "/user-log/all",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } else {
            res = await api.post(
                "/user-log",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }
        setLogs(res.data.data);
    };
    useEffect(() => {
        loadLogs();
    }, [role]);

    const filteredUserLogs = logs.filter(s => {
        const matchesText =
            String(s.log || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.userName || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.status || "").toLowerCase().includes(search.toLowerCase());

        const matchesDate = searchDate
            ? new Date(s.time).toISOString().slice(0, 10) === searchDate
            : true;

        return matchesText && matchesDate;
    });
    const totalPages = Math.ceil(filteredUserLogs.length / ITEMS_PER_PAGE);

    const paginatedLogs = filteredUserLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">User Activity</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search logs"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-48"
                    />
                    <input
                        type="date"
                        value={searchDate}
                        onChange={e => setSearchDate(e.target.value)}
                        className="border p-2 rounded w-40"
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
                    {
                        title: "Logo",
                        key: "logo",
                        render: (logo) =>
                            logo ? (
                                <img
                                    src={`${API_BASE}${logo}`}
                                    alt="Log Logo"
                                    style={{ width: 32, height: 32, objectFit: "contain" }}
                                />
                            ) : (
                                "-"
                            ),
                    },
                    { title: "Name", key: "userName" },
                    { title: "Logs", key: "log" },
                    {
                        title: "Time",
                        key: "time",
                        render: (time) =>
                            time
                                ? new Date(time).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "-",
                    },
                    { title: "Status", key: "status" }
                ]}
                data={paginatedLogs}
            />

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}