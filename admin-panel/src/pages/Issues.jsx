import { useEffect, useState } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function Issues() {
    const [issuesList, setIssuesList] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        issue: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [issuesList]);

    const token = localStorage.getItem("token");

    const loadIssues = async () => {
        try {
            const res = await api.get("/issue/");
            setIssuesList(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    useEffect(() => {
        loadIssues();
    }, []);

    const openCreate = () => {
        setForm({ issue: "" });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            issue: item.issue,
        });
        setOpenCanvas(true);
    };

    const saveIssue = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        if (editData) payload.id = editData._id;
        try {
            const res = await api.post(
                editData ? "/issue/update" : "/issue/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            setOpenCanvas(false);
            loadIssues();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const deleteIssue = async (id) => {
        try {
            const res = await api.post(
                "/issue/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadIssues();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    const filteredIssues = issuesList.filter(s =>
        s.issue.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);

    const paginatedIssues = filteredIssues.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Issues List</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search issues"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-48"
                    />
                    <button
                        onClick={openCreate}
                        className="bg-bgGreen text-white px-4 py-2 rounded"
                    >
                        Add Issue
                    </button>
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
                    { title: "Issue", key: "issue" },
                    {
                        title: "Timestamp",
                        key: "updatedAt",
                        render: (_, row) => formatDateTime(row.updatedAt)
                    },
                ]}
                data={paginatedIssues}
                actions={(row) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEdit(row)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteIssue(row._id)}
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
                title={editData ? "Edit Issue" : "Add Issue"}
            >
                <form onSubmit={saveIssue} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Issue</label>
                        <input
                            type="text"
                            value={form.issue}
                            onChange={(e) => setForm({ ...form, issue: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Issue" : "Create Issue"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}