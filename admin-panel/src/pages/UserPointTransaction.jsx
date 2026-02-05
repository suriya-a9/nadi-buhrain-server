import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";

export default function UserPointTransaction() {
    const [transaction, setTransaction] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const loadTransaction = async () => {
        setLoading(true);
        try {
            const res = await api.get("/point-transaction/");
            setTransaction(res.data.data || []);
        } catch {
            setTransaction([]);
        }
        setLoading(false);
    };
    useEffect(() => {
        loadTransaction();
    }, []);
    const filteredTransaction = transaction.filter(s =>
        String(s.senderName || "").toLowerCase().includes(search.toLowerCase()) ||
        String(s.receiverName || "").toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredTransaction.length / itemsPerPage);
    const paginatedTransaction = filteredTransaction.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Users Point Transactions</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search transaction"
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
                                title: "Sender",
                                key: "senderName"
                            },
                            {
                                title: "Receiver",
                                key: "receiverName"
                            },
                            { title: "Points", key: "points" },
                            { title: "Reason", key: "reason" },
                            { title: "Status", key: "status" },
                            {
                                title: "Date & Time",
                                key: "createdAt",
                                render: (_, row) => formatDateTime(row.createdAt)
                            },
                        ]}
                        data={paginatedTransaction}
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