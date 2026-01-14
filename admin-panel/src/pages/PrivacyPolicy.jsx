import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function PrivacyPolicy() {
    const [list, setList] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [form, setForm] = useState({
        title: "",
        content: [""],
        subs: [""],
        link: "",
        media: null
    });

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("token");

    const loadPrivacy = async () => {
        try {
            const res = await api.get("/privacy/list");
            setList(res.data.data);
        } catch {
            toast.error("Failed to load privacy data");
        }
    };

    useEffect(() => {
        loadPrivacy();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [list]);

    const openCreate = () => {
        setEditData(null);
        setForm({
            title: "",
            content: [""],
            subs: [""],
            link: "",
            media: null
        });
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            title: item.title,
            content: item.content?.length ? item.content : [""],
            subs: item.subs?.length ? item.subs : [""],
            link: item.link || "",
            media: null
        });
        setOpenCanvas(true);
    };

    const updateArray = (key, index, value) => {
        const updated = [...form[key]];
        updated[index] = value;
        setForm({ ...form, [key]: updated });
    };

    const addArrayItem = (key) => {
        setForm({ ...form, [key]: [...form[key], ""] });
    };

    const removeArrayItem = (key, index) => {
        const updated = form[key].filter((_, i) => i !== index);
        setForm({ ...form, [key]: updated.length ? updated : [""] });
    };

    const savePrivacy = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("link", form.link);

        form.content.forEach((v, i) =>
            formData.append(`content[${i}]`, v)
        );
        form.subs.forEach((v, i) =>
            formData.append(`subs[${i}]`, v)
        );

        if (form.media) formData.append("media", form.media);
        if (editData) formData.append("id", editData._id);

        try {
            const res = await api.post(
                editData ? "/privacy/update" : "/privacy/add",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            toast.success(res.data.message);
            setOpenCanvas(false);
            loadPrivacy();
        } catch {
            toast.error("Save failed");
        }
    };

    const deletePrivacy = async (id) => {
        try {
            await api.post(
                "/privacy/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Deleted successfully");
            loadPrivacy();
        } catch {
            toast.error("Delete failed");
        }
    };

    const toggleStatus = async (row, isActive) => {
        try {
            await api.post(
                "/privacy/status",
                { id: row._id, isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Status updated");
            loadPrivacy();
        } catch {
            toast.error("Status update failed");
        }
    };

    const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
    const paginated = list.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold text-textGreen">
                    Privacy Policy
                </h2>
                <button
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                    onClick={openCreate}
                >
                    + Add Policy
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {paginated.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded shadow space-y-3">
                        <h3 className="text-xl font-bold">{item.title}</h3>

                        <span
                            className={`px-2 py-1 text-xs rounded ${item.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {item.isActive ? "Active" : "Disabled"}
                        </span>

                        <div className="whitespace-pre-line">
                            {item.content?.join("\n\n")}
                        </div>

                        {item.subs?.length > 0 && (
                            <ul className="list-disc pl-5 text-sm text-gray-700">
                                {item.subs.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        )}

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

                        {item.media && (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${encodeURIComponent(item.media)}`}
                                className="h-24 rounded cursor-pointer"
                                onClick={() =>
                                    setPreviewImage(
                                        `${import.meta.env.VITE_API_URL}/uploads/${encodeURIComponent(item.media)}`
                                    )
                                }
                            />
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                                onClick={() => openEdit(item)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-600 text-white px-3 py-1 rounded"
                                onClick={() => deletePrivacy(item._id)}
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

            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded relative">
                        <button
                            className="absolute top-2 right-2 text-red-600"
                            onClick={() => setPreviewImage(null)}
                        >
                            ✕
                        </button>
                        <img src={previewImage} className="max-h-[80vh]" />
                    </div>
                </div>
            )}

            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit Privacy Policy" : "Add Privacy Policy"}
            >
                <form onSubmit={savePrivacy} className="space-y-4">
                    <input
                        className="w-full border p-2 rounded"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        required
                    />

                    <div>
                        <label className="font-medium">Content</label>
                        {form.content.map((v, i) => (
                            <div key={i}>
                                <textarea
                                    className="w-full border p-2 rounded mt-2"
                                    value={v}
                                    onChange={(e) =>
                                        updateArray("content", i, e.target.value)
                                    }
                                />
                                {form.content.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-600 text-sm"
                                        onClick={() =>
                                            removeArrayItem("content", i)
                                        }
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-bgGreen text-sm"
                            onClick={() => addArrayItem("content")}
                        >
                            + Add Content
                        </button>
                    </div>

                    <div>
                        <label className="font-medium">Sub Points</label>
                        {form.subs.map((v, i) => (
                            <div key={i}>
                                <input
                                    className="w-full border p-2 rounded mt-2"
                                    value={v}
                                    onChange={(e) =>
                                        updateArray("subs", i, e.target.value)
                                    }
                                />
                                {form.subs.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-600 text-sm"
                                        onClick={() =>
                                            removeArrayItem("subs", i)
                                        }
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-bgGreen text-sm"
                            onClick={() => addArrayItem("subs")}
                        >
                            + Add Sub
                        </button>
                    </div>

                    <input
                        className="w-full border p-2 rounded"
                        placeholder="Link"
                        value={form.link}
                        onChange={(e) =>
                            setForm({ ...form, link: e.target.value })
                        }
                    />

                    <input
                        type="file"
                        className="w-full border p-2 rounded"
                        onChange={(e) =>
                            setForm({ ...form, media: e.target.files[0] })
                        }
                    />

                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Policy" : "Create Policy"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}