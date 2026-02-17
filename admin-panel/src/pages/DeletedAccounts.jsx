import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";

export default function DeletedAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/deleted-accounts/");
            setAccounts(res.data.data || []);
        } catch {
            setAccounts([]);
        }
        setLoading(false);
    }
    useEffect(() => {
        loadAccounts();
    }, []);
    const filteredAccounts = accounts.filter(s =>
        String(s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(s.role || "").toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Deleted Accounts</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search accounts"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-48"
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
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * itemsPerPage + idx + 1,
                            },
                            {
                                title: "Name",
                                key: "name"
                            },
                            {
                                title: "Email",
                                key: "email"
                            },
                            { title: "User", key: "role" },
                            { title: "Reason", key: "reasonId.reason" },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedAccounts}
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