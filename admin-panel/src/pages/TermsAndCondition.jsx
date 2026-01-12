import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function TermsAndCondition() {
    const [termsAndCondition, setTermsAndCondition] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({
        id: "",
        content: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [termsAndCondition]);
    const token = localStorage.getItem("token");
    const loadTermsAndCondition = async () => {
        try {
            const res = await api.get("/terms/list");
            setTermsAndCondition(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    useEffect(() => {
        loadTermsAndCondition();
    }, []);
    const openCreate = () => {
        setForm({
            content: "",
        });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            content: item.content,
        });
        setOpenCanvas(true);
    };
    const saveTermsAndCondition = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        if (editData) payload.id = editData._id;
        try {
            const res = await api.post(
                editData ? "/terms/update" : "/terms/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            setOpenCanvas(false);
            loadTermsAndCondition();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    const deleteTermsAndCondition = async (id) => {
        try {
            const res = await api.post(
                "/terms/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadTermsAndCondition();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    const setEnabled = async (row, enabled) => {
        try {
            const res = await api.post(
                "/terms/set-enabled",
                { id: row._id, enabled },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadTermsAndCondition();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    const totalPages = Math.ceil(termsAndCondition.length / ITEMS_PER_PAGE);

    const paginatedTermsAndCondition = termsAndCondition.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Terms and Condition</h2>
                <button
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                    onClick={() => {
                        setForm({ id: "", content: "" });
                        setOpenCanvas(true);
                    }}
                >
                    + Add Terms and Condition
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedTermsAndCondition.map((item) => (
                    <div
                        key={item._id}
                        className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-lg font-bold mb-2">Content</h3>
                        <div className="text-gray-700 whitespace-pre-line break-words">
                            {item.content}
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                onClick={() => openEdit(item)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                onClick={() => deleteTermsAndCondition(item._id)}
                            >
                                Delete
                            </button>
                            <button
                                className={`px-3 py-1 rounded ${item.enabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"} text-white`}
                                onClick={() => setEnabled(item, !item.enabled)}
                            >
                                {item.enabled ? "Disable" : "Enable"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
                title={editData ? "Edit Terms and Condition" : "Add Terms and Condition"}
            >
                <form onSubmit={saveTermsAndCondition} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Terms and Condition</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="w-full border p-2 rounded"
                            rows={5}
                            required
                        />
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Terms and Condition" : "Create Terms and Condition"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}