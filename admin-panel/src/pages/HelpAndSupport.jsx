import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function HelpAndSupport() {
    const [helpList, setHelpList] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({
        content_en: "",
        content_ar: "",
        link: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("token");
    const loadHelp = async () => {
        try {
            const res = await api.get("/help/list");
            setHelpList(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load help and support data");
        }
    };
    useEffect(() => {
        loadHelp();
    }, []);
    useEffect(() => {
        setCurrentPage(1);
    }, [helpList]);
    const openEdit = (item) => {
        setEditData(item);
        setForm({
            content_en: item.content_en,
            content_ar: item.content_ar,
            link: item.link || ""
        });
        setOpenCanvas(true);
    };
    const saveHelp = async (e) => {
        e.preventDefault();

        const payload = {
            content_en: form.content_en,
            content_ar: form.content_ar,
            link: form.link
        };

        if (editData) {
            payload.id = editData._id;
        }

        try {
            const res = await api.post(
                editData ? "/help/update" : "/help/add",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message);
            setOpenCanvas(false);
            loadHelp();
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
        }
    };
    const toggleStatus = async (row, isActive) => {
        try {
            const res = await api.post(
                "/help/status",
                { id: row._id, isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadHelp();
        } catch (err) {
            toast.error(err.response?.data?.message || "Status update failed");
        }
    };
    const deleteHelp = async (id) => {
        try {
            const res = await api.post(
                "/help/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadHelp();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };
    const totalPages = Math.ceil(helpList.length / ITEMS_PER_PAGE);
    const paginatedHelp = helpList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold text-textGreen">Help and Support</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedHelp.map((item) => (
                    <div
                        key={item._id}
                        className="bg-white shadow-md rounded-lg p-4 space-y-3"
                    >


                        <span
                            className={`inline-block px-2 py-1 text-xs rounded ${item.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {item.isActive ? "Active" : "Disabled"}
                        </span>

                        <div className="space-y-2">
                            <div>
                                <strong>English:</strong>
                                <ul className="list-disc pl-5">
                                    {item.content_en
                                        ? item.content_en.split('\n').map((v, i) => (
                                            <li key={i}>{v}</li>
                                        ))
                                        : null}
                                </ul>
                            </div>
                            <div>
                                <strong>Arabic:</strong>
                                <ul className="list-disc pl-5">
                                    {item.content_ar
                                        ? item.content_ar.split('\n').map((v, i) => (
                                            <li key={i}>{v}</li>
                                        ))
                                        : null}
                                </ul>
                            </div>
                        </div>

                        {item.link && (
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline break-all"
                            >
                                {item.link}
                            </a>
                        )}

                        <div className="text-xs text-gray-500">
                            {/* <div>Created: {new Date(item.createdAt).toLocaleString()}</div> */}
                            <div>Timestamp: {new Date(item.updatedAt).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                                onClick={() => openEdit(item)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-600 text-white px-3 py-1 rounded"
                                onClick={() => deleteHelp(item._id)}
                            >
                                Delete
                            </button>
                            <button
                                className={`px-3 py-1 rounded text-white ${item.isActive ? "bg-green-600" : "bg-gray-400"
                                    }`}
                                onClick={() =>
                                    toggleStatus(item, !item.isActive)
                                }
                            >
                                {item.isActive ? "Disable" : "Enable"}
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
                title={editData ? "Edit Help" : "Add Help"}
            >
                <form onSubmit={saveHelp} className="space-y-4">
                    <textarea
                        className="w-full border p-2 rounded resize-none"
                        placeholder="Content"
                        rows={6}
                        value={form.content_en}
                        onChange={(e) =>
                            setForm({ ...form, content_en: e.target.value })
                        }
                    />
                    <textarea
                        className="w-full border p-2 rounded resize-none"
                        placeholder="Content"
                        rows={6}
                        value={form.content_ar}
                        onChange={(e) =>
                            setForm({ ...form, content_ar: e.target.value })
                        }
                    />
                    <input
                        className="w-full border p-2 rounded"
                        placeholder="Link"
                        value={form.link}
                        onChange={(e) =>
                            setForm({ ...form, link: e.target.value })
                        }
                    />
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Help" : "Create Help"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}