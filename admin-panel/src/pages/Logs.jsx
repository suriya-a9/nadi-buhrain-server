import { useEffect, useState } from "react";
import Table from "../components/Table";
import api from "../services/api";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

const ROLES = [
    { label: "All", value: "all" },
    { label: "Admin User", value: "admin" },
    { label: "User", value: "user" },
    { label: "Technician", value: "technician" },
];

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("all");
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");
    useEffect(() => {
        setCurrentPage(1);
    }, [logs]);
    const token = localStorage.getItem("token");
    const { role } = useAuth();
    const loadLogs = async () => {
        setLoading(true);
        try {
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
        } catch (err) {
            console.error(err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
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

        const matchesRole =
            activeTab === "all" ? true : String(s.role || "").toLowerCase() === activeTab;

        return matchesText && matchesDate && matchesRole;
    });
    const totalPages = Math.ceil(filteredUserLogs.length / itemsPerPage);

    const paginatedLogs = filteredUserLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
                </div>
            </div>
            {role === "Super Admin" && (
                <div className="flex gap-2 mb-4">
                    {ROLES.map(tab => (
                        <button
                            key={tab.value}
                            className={`px-4 py-2 rounded ${activeTab === tab.value ? "bg-textGreen text-white" : "bg-gray-200 text-gray-700"}`}
                            onClick={() => setActiveTab(tab.value)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <div className="mb-2 text-left text-sm text-gray-600">
                        Total no of User Logs: {filteredUserLogs.length}
                    </div>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * itemsPerPage + idx + 1,
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
                                    ) : "-",
                            },
                            {
                                title: "Name",
                                key: "userName",
                                render: (_, row) => {
                                    const mobile =
                                        row.userMobileNumber ||
                                        (row.userId && row.userId.basicInfo && row.userId.basicInfo.mobileNumber) ||
                                        row.mobileNumber ||
                                        "";
                                    return mobile
                                        ? `${row.userName} / ${mobile}`
                                        : row.userName;
                                },
                            },
                            { title: "Logs", key: "log" },
                            {
                                title: "Date & Time",
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
                            { title: "Status", key: "status" },
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
                </>
            )}
        </div>
    )
}