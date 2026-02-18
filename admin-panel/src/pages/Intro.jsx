import { useState, useEffect } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import toast from "react-hot-toast";

export default function Intro() {
    const [introList, setIntroList] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        id: "",
        content_en: [""],
        content_ar: [""],
    });

    const token = localStorage.getItem("token");

    const loadIntro = async () => {
        try {
            const res = await api.get("/intro/list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIntroList(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    useEffect(() => {
        loadIntro();
    }, []);

    const handleContentChange = (lang, value, index) => {
        const updated = [...form[lang]];
        updated[index] = value;
        setForm({ ...form, [lang]: updated });
    };

    const addContentField = (lang) => {
        setForm({ ...form, [lang]: [...form[lang], ""] });
    };

    const removeContentField = (lang, index) => {
        const updated = form[lang].filter((_, i) => i !== index);
        setForm({ ...form, [lang]: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const body = {
            id: form.id,
            content_en: form.content_en,
            content_ar: form.content_ar
        };

        try {
            if (!form.id) {
                const res = await api.post("/intro/add", body, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(res.data.message);
            } else {
                const res = await api.post("/intro/update", body, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(res.data.message);
            }

            setOpen(false);
            loadIntro();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const editIntro = (intro) => {
        setForm({
            id: intro._id,
            content_en: intro.content_en || [""],
            content_ar: intro.content_ar || [""]
        });
        setOpen(true);
    };

    const deleteIntro = async (id) => {
        try {
            const res = await api.post(
                "/intro/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadIntro();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const toggleStatus = async (id, status) => {
        try {
            const res = await api.post(
                "/intro/set-status",
                { id, status: !status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadIntro();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Intro Content</h2>
                <button
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                    onClick={() => {
                        setForm({
                            id: "",
                            content_en: [""],
                            content_ar: [""]
                        });
                        setOpen(true);
                    }}
                >
                    + Add Intro
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {introList.map((intro) => (
                    <div
                        key={intro._id}
                        className={`bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow border-2 ${intro.status ? "border-green-400" : "border-gray-300"}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold">Intro</h3>
                            <span className={`text-xs px-2 py-1 rounded ${intro.status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                                {intro.status ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <strong>English:</strong>
                                <ul className="list-disc pl-5">
                                    {intro.content_en?.map((v, i) => (
                                        <li key={i}>{v}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <strong>Arabic:</strong>
                                <ul className="list-disc pl-5">
                                    {intro.content_ar?.map((v, i) => (
                                        <li key={i}>{v}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                className={`px-3 py-1 rounded ${intro.status ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"} text-white`}
                                onClick={() => toggleStatus(intro._id, intro.status)}
                            >
                                {intro.status ? "Disable" : "Enable"}
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                onClick={() => editIntro(intro)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                onClick={() => deleteIntro(intro._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Offcanvas
                open={open}
                onClose={() => setOpen(false)}
                title={form.id ? "Edit Intro" : "Add Intro"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <h3 className="font-bold text-lg mb-2">English Content</h3>
                        {form.content_en.map((val, i) => (
                            <div key={i} className="mb-3">
                                <textarea
                                    value={val}
                                    onChange={(e) =>
                                        handleContentChange("content_en", e.target.value, i)
                                    }
                                    className="border p-2 rounded w-full"
                                    rows={3}
                                    required
                                />
                                {form.content_en.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeContentField("content_en", i)}
                                        className="text-red-600 text-sm mt-1"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addContentField("content_en")}
                            className="bg-gray-200 px-3 py-1 rounded"
                        >
                            + Add English
                        </button>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2">Arabic Content</h3>
                        {form.content_ar.map((val, i) => (
                            <div key={i} className="mb-3">
                                <textarea
                                    value={val}
                                    onChange={(e) =>
                                        handleContentChange("content_ar", e.target.value, i)
                                    }
                                    className="border p-2 rounded w-full"
                                    rows={3}
                                />
                                {form.content_ar.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeContentField("content_ar", i)}
                                        className="text-red-600 text-sm mt-1"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addContentField("content_ar")}
                            className="bg-gray-200 px-3 py-1 rounded"
                        >
                            + Add Arabic
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="bg-bgGreen w-full text-white py-2 rounded"
                    >
                        {form.id ? "Update Intro" : "Create Intro"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}