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
        name: "",
        points: "",
        serviceImage: null,
        serviceLogo: null,
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [services]);
    const loadServices = async () => {
        setLoading(true);
        const res = await api.get("/service");
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
        fd.append("name", form.name);
        fd.append("points", form.points);
        if (form.serviceImage) fd.append("serviceImage", form.serviceImage);
        if (form.serviceLogo) fd.append("serviceLogo", form.serviceLogo);

        if (form.id) fd.append("id", form.id);
        try {
            const res = await api.post(form.id ? "/service/edit" : "/service/add", fd);
            toast.success(res.data.message);
            loadServices();
            setOpenCanvas(false);
            setForm({ id: "", name: "", points: "", serviceImage: null, serviceLogo: null });
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const editService = (s) => {
        setForm({
            id: s._id,
            name: s.name,
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
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
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
                    <button
                        className="bg-bgGreen text-white px-4 py-2 rounded"
                        onClick={() => {
                            setForm({ id: "", name: "", serviceImage: null, serviceLogo: null });
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
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "Name", key: "name" },
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
                        <label className="block mb-1 font-medium">Service Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
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