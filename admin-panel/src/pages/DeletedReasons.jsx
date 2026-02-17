import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function DeletedReasons() {
    const [reasons, setReasons] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        reason: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [reasons]);
    const token = localStorage.getItem("token");
    const loadReasons = async () => {
        setLoading(true);
        const res = await api.get("/delete-Reasons/");
        setReasons(res.data.data);
        setLoading(false);
    };
    useEffect(() => {
        loadReasons();
    }, []);
    const openCreate = () => {
        setForm({ reason: "" });
        setEditData(null);
        setOpenCanvas(true);
    };
    const openEdit = (item) => {
        setEditData(item);
        setForm({
            reason: item.reason,
        });
        setOpenCanvas(true);
    };
    const saveReason = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (editData) payload.id = editData._id;

            const res = await api.post(
                editData ? "/delete-Reasons/update" : "/delete-Reasons/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            setOpenCanvas(false);
            loadReasons();

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Something went wrong"
            );
        }
    };
    const deleteReason = async (id) => {
        try {
            const res = await api.post(
                "/delete-Reasons/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            loadReasons();

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Something went wrong"
            );
        }
    };
    const totalPages = Math.ceil(reasons.length /
        ITEMS_PER_PAGE
    );
    const PaginatedReasons = reasons.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Roles List</h2>
                <button
                    onClick={openCreate}
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                >
                    Add Reasons
                </button>
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
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "Reason", key: "reason" },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={PaginatedReasons}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(row)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteReason(row._id)}
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
                title={editData ? "Edit Reason" : "Add Reason"}
            >
                <form onSubmit={saveReason} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Reason</label>
                        <input
                            type="text"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Reason" : "Create Reason"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}