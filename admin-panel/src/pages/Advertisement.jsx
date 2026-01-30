import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function Advertisement() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [form, setForm] = useState({
        id: "",
        images: [],
        links: [],
        video: null,
    });
    const [statusLoading, setStatusLoading] = useState(false);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        setLoading(true);
        try {
            const res = await api.get("/advertisement/list");
            setAds(res.data.data);
        } catch (err) {
            toast.error("Failed to load advertisements");
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        if (e.target.name === "images") {
            setForm({ ...form, images: Array.from(e.target.files) });
        } else if (e.target.name === "video") {
            setForm({ ...form, video: e.target.files[0] });
        } else if (e.target.name.startsWith("link")) {
            const idx = parseInt(e.target.name.split("_")[1]);
            const newLinks = [...form.links];
            newLinks[idx] = e.target.value;
            setForm({ ...form, links: newLinks });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleAdd = () => {
        setForm({ id: "", images: [], links: [], video: null });
        setOpenCanvas(true);
    };

    const handleEdit = (ad) => {
        setForm({
            id: ad._id,
            images: [],
            links: ad.ads?.map(a => a.link) || [],
            video: null,
        });
        setOpenCanvas(true);
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <span>
                Are you sure you want to delete this advertisement?<br />
                <button
                    className="bg-red-600 text-white px-3 py-1 rounded mr-2 mt-2"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.post("/advertisement/delete", { id });
                            toast.success("Advertisement deleted");
                            loadAds();
                        } catch (err) {
                            toast.error(err.response?.data?.message || "Delete failed");
                        }
                    }}
                >
                    Yes, Delete
                </button>
                <button
                    className="bg-gray-300 px-3 py-1 rounded mt-2"
                    onClick={() => toast.dismiss(t.id)}
                >
                    Cancel
                </button>
            </span>
        ), { duration: 10000 });
    };

    const handleStatus = async (id, status) => {
        setStatusLoading(true);
        try {
            await api.post("/advertisement/status", { id, status: !status });
            toast.success("Status updated");
            loadAds();
        } catch (err) {
            toast.error(err.response?.data?.message || "Status update failed");
        }
        setStatusLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        if (form.id) fd.append("id", form.id);

        if (form.video) {
            fd.append("video", form.video);
        } else if (form.images.length) {
            form.images.forEach((img) => fd.append("images", img));
            form.links.forEach((l) => fd.append("link", l));
        } else {
            toast.error("Provide either images with links or a video");
            return;
        }

        try {
            const url = form.id ? "/advertisement/update" : "/advertisement/add";
            await api.post(url, fd);
            toast.success(form.id ? "Advertisement updated" : "Advertisement created");
            setOpenCanvas(false);
            loadAds();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const totalPages = Math.ceil(ads.length / ITEMS_PER_PAGE);
    const paginatedAds = ads.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Advertisements</h2>
                <button
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                    onClick={handleAdd}
                >
                    + Add Advertisement
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
                            {
                                title: "Type",
                                key: "type",
                                render: (_, row) =>
                                    row.video ? "Video" : "Images",
                            },
                            {
                                title: "Media",
                                key: "preview",
                                render: (_, row) =>
                                    row.video ? (
                                        <video
                                            src={`${import.meta.env.VITE_API_URL}/uploads/${row.video}`}
                                            controls
                                            className="h-16"
                                        />
                                    ) : row.ads?.length ? (
                                        <div className="flex gap-1">
                                            {row.ads.map((a, i) => (
                                                <a
                                                    key={i}
                                                    href={a.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/uploads/${a.image}`}
                                                        className="h-12 rounded border"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        "-"
                                    ),
                            },
                            {
                                title: "Status",
                                key: "status",
                                render: (val, row) => (
                                    <button
                                        className={`px-3 py-1 rounded ${row.status ? "bg-green-500" : "bg-gray-400"} text-white`}
                                        disabled={statusLoading}
                                        onClick={() => handleStatus(row._id, row.status)}
                                    >
                                        {row.status ? "Active" : "Inactive"}
                                    </button>
                                ),
                            },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedAds}
                        actions={(row) => (
                            <div>
                                <button
                                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                    onClick={() => handleEdit(row)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                    onClick={() => handleDelete(row._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={form.id ? "Edit Advertisement" : "Add Advertisement"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="block mb-1 font-medium">Video</label>
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="block mb-1 font-medium">
                            Images (multiple allowed)
                        </label>
                        <input
                            type="file"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        />
                        {form.images.length > 0 &&
                            form.images.map((_, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    name={`link_${idx}`}
                                    placeholder={`Link for image ${idx + 1}`}
                                    value={form.links[idx] || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full mt-1"
                                    required
                                />
                            ))}
                    </div>
                    <button
                        type="submit"
                        className="bg-bgGreen w-full text-white py-2 rounded"
                    >
                        {form.id ? "Update Advertisement" : "Create Advertisement"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}