import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function Services() {
    const [services, setServices] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: "",
        name_ar: "",
        name_en: "",
        points: "",
        serviceImage: null,
        serviceLogo: null,
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [services]);
    const loadServices = async () => {
        setLoading(true);
        const res = await api.get("/service/list");
        setServices(res.data.data);
        setLoading(false);
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.type === "file" ? e.target.files[0] : e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData();
        fd.append("name_en", form.name_en);
        fd.append("name_ar", form.name_ar);
        fd.append("points", form.points);
        if (form.serviceImage) fd.append("serviceImage", form.serviceImage);
        if (form.serviceLogo) fd.append("serviceLogo", form.serviceLogo);

        if (form.id) fd.append("id", form.id);
        try {
            const res = await api.post(form.id ? "/service/edit" : "/service/add", fd);
            toast.success(res.data.message);
            loadServices();
            setOpenCanvas(false);
            setForm({ id: "", name_ar: "", name_en: "", points: "", serviceImage: null, serviceLogo: null });
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const editService = (s) => {
        setForm({
            id: s._id,
            name_ar: s.name_ar,
            name_en: s.name_en,
            points: s.points,
            serviceImage: null,
            serviceLogo: null,
        });
        setOpenCanvas(true);
    };

    const deleteService = async (id) => {
        try {
            const res = await api.post("/service/delete", { id });
            toast.success(res.data.message);
            loadServices();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    const filteredServices = services.filter(s =>
        (s.name_en || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.name_ar || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Services</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search services"
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
                    <button
                        className="bg-bgGreen text-white px-4 py-2 rounded"
                        onClick={() => {
                            setForm({ id: "", name_en: "", name_ar: "", serviceImage: null, serviceLogo: null });
                            setOpenCanvas(true);
                        }}
                    >
                        + Add Service
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <div className="mb-2 text-left text-sm text-gray-600">
                        Total no of Services: {filteredServices.length}
                    </div>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * itemsPerPage + idx + 1,
                            },
                            { title: "Name (En)", key: "name_en" },
                            { title: "Name (Ar)", key: "name_ar" },
                            { title: "Points", key: "points" },
                            {
                                title: "Image",
                                key: "serviceImage",
                                render: (value) =>
                                    value ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/${value}`}
                                            className="h-12 rounded border"
                                        />
                                    ) : (
                                        "-"
                                    ),
                            },
                            {
                                title: "Logo",
                                key: "serviceLogo",
                                render: (value) =>
                                    value ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/${value}`}
                                            className="h-12 rounded border"
                                        />
                                    ) : (
                                        "-"
                                    ),
                            },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedServices}
                        actions={(row) => (
                            <div>
                                <button
                                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                    onClick={() => editService(row)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                    onClick={() => deleteService(row._id)}
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
                title={form.id ? "Edit Service" : "Add Service"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="flex flex-col gap-1">
                        <label className="block mb-1 font-medium">Service Name (En)</label>
                        <input
                            type="text"
                            name="name_en"
                            value={form.name_en}
                            onChange={handleChange}
                            placeholder="Enter Service Name"
                            required
                            className="border p-2 rounded w-full"
                        />
                        <label className="block mb-1 font-medium">Service Name (Ar)</label>
                        <input
                            type="text"
                            name="name_ar"
                            value={form.name_ar}
                            onChange={handleChange}
                            placeholder="Enter Service Name"
                            required
                            className="border p-2 rounded w-full"
                        />
                        <label className="block mb-1 font-medium">Service Points</label>
                        <input
                            type="text"
                            name="points"
                            value={form.points}
                            onChange={handleChange}
                            placeholder="Enter Service Points"
                            required
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="block mb-1 font-medium">Service Image <span className="text-xs">(size: 375px X 375px)</span></label>
                        <input
                            type="file"
                            name="serviceImage"
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="block mb-1 font-medium">Service Logo <span className="text-xs">(size: 64px X 64px)</span></label>
                        <input
                            type="file"
                            name="serviceLogo"
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-bgGreen w-full text-white py-2 rounded"
                    >
                        {form.id ? "Update Service" : "Create Service"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}