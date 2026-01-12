import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import toast from "react-hot-toast";

export default function LoadingScreen() {
    const [screens, setScreens] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        id: "",
        image: null,
        video: null,
    });
    const [mediaModal, setMediaModal] = useState({
        open: false,
        url: "",
        type: "",
    });

    const token = localStorage.getItem("token");

    const loadScreens = async () => {
        const res = await api.get("/user/loading/all", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setScreens(res.data.data || []);
    };

    useEffect(() => {
        loadScreens();
    }, []);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith("image/")) {
            setForm((prev) => ({ ...prev, image: file, video: null }));
        } else if (file.type.startsWith("video/")) {
            setForm((prev) => ({ ...prev, video: file, image: null }));
        } else {
            alert("Only image or video allowed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.image && !form.video) {
            alert("Please select an image or a video");
            return;
        }

        const formData = new FormData();
        if (form.image) formData.append("image", form.image);
        if (form.video) formData.append("video", form.video);
        if (form.id) formData.append("id", form.id);

        await api.post(
            form.id ? "/user/loading/update" : "/user/loading/upload",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        setOpen(false);
        setForm({ id: "", image: null, video: null });
        loadScreens();
    };
    const editScreen = (row) => {
        setForm({ id: row._id, image: null, video: null });
        setOpen(true);
    };

    const deleteScreen = async (row) => {
        await api.post(
            "/user/loading/delete",
            { id: row._id },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        loadScreens();
    };

    const setEnabled = async (row, enabled) => {
        try {
            await api.post(
                "/user/loading/set-enabled",
                { id: row._id, enabled },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadScreens();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const handleMediaClick = (screen) => {
        if (screen.image) {
            setMediaModal({
                open: true,
                url: `${import.meta.env.VITE_API_URL}/uploads/${screen.image}`,
                type: "image",
            });
        } else if (screen.video) {
            setMediaModal({
                open: true,
                url: `${import.meta.env.VITE_API_URL}/uploads/${screen.video}`,
                type: "video",
            });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Loading Screen</h2>
                <button
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                    onClick={() => {
                        setForm({ id: "", image: null, video: null });
                        setOpen(true);
                    }}
                >
                    + Upload New
                </button>
            </div>

            {screens.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <p className="text-lg">No loading screen uploaded yet.</p>
                    <button
                        className="mt-4 bg-bgGreen text-white px-4 py-2 rounded"
                        onClick={() => {
                            setForm({ id: "", image: null, video: null });
                            setOpen(true);
                        }}
                    >
                        ➕ Upload Loading Screen
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {screens.map((screen) => (
                        <div
                            key={screen._id}
                            className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div
                                className="bg-gray-100 p-4 flex justify-center cursor-pointer"
                                onClick={() => handleMediaClick(screen)}
                            >
                                {screen.image ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/uploads/${screen.image}`}
                                        className="h-48 object-contain rounded border"
                                    />
                                ) : screen.video ? (
                                    <video
                                        src={`${import.meta.env.VITE_API_URL}/uploads/${screen.video}`}
                                        className="h-48 object-contain rounded border"
                                        muted
                                        preload="metadata"
                                    />
                                ) : (
                                    <span>No media</span>
                                )}
                            </div>

                            <div className="p-4 flex justify-end gap-2">
                                <button
                                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                                    onClick={() => editScreen(screen)}
                                >
                                    Replace
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                    onClick={() => deleteScreen(screen)}
                                >
                                    Delete
                                </button>
                                <button
                                    className={`px-4 py-2 rounded text-white ${screen.enabled ? "bg-green-600" : "bg-gray-400"
                                        }`}
                                    onClick={() => setEnabled(screen, !screen.enabled)}
                                >
                                    {screen.enabled ? "Disable" : "Enable"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mediaModal.open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={() => setMediaModal({ open: false, url: "", type: "" })}
                >
                    <div
                        className="bg-white rounded-lg p-4 max-w-lg w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2"
                            onClick={() =>
                                setMediaModal({ open: false, url: "", type: "" })
                            }
                        >
                            ✕
                        </button>

                        {mediaModal.type === "image" ? (
                            <img src={mediaModal.url} className="w-full rounded" />
                        ) : (
                            <video
                                src={mediaModal.url}
                                controls
                                autoPlay
                                className="w-full rounded"
                            />
                        )}
                    </div>
                </div>
            )}

            <Offcanvas
                open={open}
                onClose={() => setOpen(false)}
                title={form.id ? "Update Loading Screen" : "Upload Loading Screen"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="font-medium block mb-1">
                            Select Image / Video
                        </label>
                        <input
                            key={open ? "open" : "closed"}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-bgGreen w-full text-white py-2 rounded"
                    >
                        {form.id ? "Update" : "Upload"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}
