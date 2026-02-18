import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function About() {
    const [aboutList, setAboutList] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [form, setForm] = useState({
        title: "",
        content_en: [""],
        content_ar: [""],
        link: "",
        version: "",
        media: null
    });

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem("token");


    const loadAbout = async () => {
        try {
            const res = await api.get("/about/list");
            setAboutList(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load about data");
        }
    };

    useEffect(() => {
        loadAbout();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [aboutList]);

    const openCreate = () => {
        setEditData(null);
        setForm({
            title: "",
            content_en: [""],
            content_ar: [""],
            link: "",
            version: "",
            media: null
        });
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            title: item.title,
            content_en: Array.isArray(item.content_en) && item.content_en.length
                ? item.content_en
                : [""],
            content_ar: Array.isArray(item.content_ar) && item.content_ar.length
                ? item.content_ar
                : [""],
            link: item.link || "",
            version: item.version || "",
            media: null
        });
        setOpenCanvas(true);
    };

    const updateContent = (lang, value, index) => {
        const updated = [...form[lang]];
        updated[index] = value;
        setForm({ ...form, [lang]: updated });
    };

    const addContent = (lang) => {
        setForm({ ...form, [lang]: [...form[lang], ""] });
    };

    const removeContent = (lang, index) => {
        const updated = form[lang].filter((_, i) => i !== index);
        setForm({ ...form, [lang]: updated });
    };


    const saveAbout = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("link", form.link);
        formData.append("version", form.version);

        form.content_en.forEach((value, index) => {
            formData.append(`content_en[${index}]`, value);
        });
        form.content_ar.forEach((value, index) => {
            formData.append(`content_ar[${index}]`, value);
        });

        if (form.media) {
            formData.append("media", form.media);
        }

        if (editData) {
            formData.append("id", editData._id);
        }

        try {
            const res = await api.post(
                editData ? "/about/update" : "/about/add",
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
            loadAbout();
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
        }
    };


    const deleteAbout = async (id) => {
        try {
            const res = await api.post(
                "/about/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadAbout();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const toggleStatus = async (row, isActive) => {
        try {
            const res = await api.post(
                "/about/status",
                { id: row._id, isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadAbout();
        } catch (err) {
            toast.error(err.response?.data?.message || "Status update failed");
        }
    };

    const totalPages = Math.ceil(aboutList.length / ITEMS_PER_PAGE);
    const paginatedAbout = aboutList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold text-textGreen">About</h2>
                <button
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                    onClick={openCreate}
                >
                    + Add About
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedAbout.map((item) => (
                    <div
                        key={item._id}
                        className="bg-white shadow-md rounded-lg p-4 space-y-3"
                    >
                        <h3 className="text-xl font-bold">{item.title}</h3>

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
                                    {item.content_en?.map((v, i) => (
                                        <li key={i}>{v}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <strong>Arabic:</strong>
                                <ul className="list-disc pl-5">
                                    {item.content_ar?.map((v, i) => (
                                        <li key={i}>{v}</li>
                                    ))}
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

                        {item.version && (
                            <div className="text-sm text-gray-600">
                                <strong>Version:</strong> {item.version}
                            </div>
                        )}

                        {item.media && (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${encodeURIComponent(item.media)}`}
                                className="h-24 rounded border cursor-pointer"
                                onClick={() =>
                                    setPreviewImage(
                                        `${import.meta.env.VITE_API_URL}/uploads/${encodeURIComponent(item.media)}`
                                    )
                                }
                            />
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
                                onClick={() => deleteAbout(item._id)}
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
                    <div className="relative bg-white p-4 rounded max-w-3xl">
                        <button
                            className="absolute top-2 right-2 text-red-600 text-xl"
                            onClick={() => setPreviewImage(null)}
                        >
                            ✕
                        </button>
                        <img
                            src={previewImage}
                            className="max-h-[80vh] max-w-full rounded"
                        />
                    </div>
                </div>
            )}

            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit About" : "Add About"}
            >
                <form onSubmit={saveAbout} className="space-y-4">
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
                        <label className="font-medium">English Content</label>
                        {form.content_en.map((value, index) => (
                            <div key={index} className="mt-2">
                                <textarea
                                    className="w-full border p-2 rounded"
                                    rows={4}
                                    value={value}
                                    onChange={(e) =>
                                        updateContent("content_en", e.target.value, index)
                                    }
                                    required
                                />
                                {form.content_en.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-600 text-sm"
                                        onClick={() => removeContent("content_en", index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-bgGreen text-sm mt-2"
                            onClick={() => addContent("content_en")}
                        >
                            + Add More English Content
                        </button>
                    </div>

                    <div>
                        <label className="font-medium">Arabic Content</label>
                        {form.content_ar.map((value, index) => (
                            <div key={index} className="mt-2">
                                <textarea
                                    className="w-full border p-2 rounded"
                                    rows={4}
                                    value={value}
                                    onChange={(e) =>
                                        updateContent("content_ar", e.target.value, index)
                                    }
                                />
                                {form.content_ar.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-600 text-sm"
                                        onClick={() => removeContent("content_ar", index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-bgGreen text-sm mt-2"
                            onClick={() => addContent("content_ar")}
                        >
                            + Add More Arabic Content
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
                        className="w-full border p-2 rounded"
                        placeholder="Version"
                        value={form.version}
                        onChange={(e) =>
                            setForm({ ...form, version: e.target.value })
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
                        {editData ? "Update About" : "Create About"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}