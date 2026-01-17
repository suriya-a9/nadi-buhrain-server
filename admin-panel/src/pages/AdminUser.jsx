import { useEffect, useState } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import toast from "react-hot-toast";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";

export default function AdminUser() {
    const [admins, setAdmins] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [roles, setRoles] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });
    const [loading, setLoading] = useState(false);

    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem("token");

    const fetchAdmins = async () => {
        setLoading(true);
        const res = await api.get("/admin/list", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(res.data.data);
        setLoading(false);
    };

    const fetchRoles = async () => {
        const res = await api.get("/role/");
        setRoles(res.data.data);
    };

    useEffect(() => {
        fetchAdmins();
        fetchRoles();
    }, []);

    const openCreate = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            role: roles[0]?._id || "",
        });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (admin) => {
        setEditData(admin);
        setForm({
            name: admin.name,
            email: admin.email,
            password: "",
            role: admin.role?._id || admin.role,
        });
        setOpenCanvas(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let res;

            if (editData) {
                res = await api.post(
                    `/admin/${editData._id}`,
                    {
                        name: form.name,
                        role: form.role,
                        ...(form.password ? { password: form.password } : {}),
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                toast.success(res.data.message);
            } else {
                res = await api.post("/admin/register", form, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                toast.success(res.data.message);
            }

            setOpenCanvas(false);
            setForm({ name: "", email: "", password: "", role: "" });
            setEditData(null);
            fetchAdmins();

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Something went wrong"
            );
        }
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch =
            admin.name.toLowerCase().includes(search.toLowerCase()) ||
            admin.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter ? (admin.role?._id === roleFilter || admin.role === roleFilter) : true;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);
    const paginatedAdmins = filteredAdmins.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[20px] sm:text-[25px] font-bold mb-2 sm:mb-6 text-textGreen">Admin Users</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-full sm:w-48"
                    />
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="border p-2 rounded w-40"
                    >
                        <option value="">All Roles</option>
                        {roles.map(r => (
                            <option key={r._id} value={r._id}>
                                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={openCreate}
                        className="bg-bgGreen text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                        Add Admin User
                    </button>
                </div>
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
                                title: "s/no",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "Name", key: "name" },
                            { title: "Email", key: "email" },
                            {
                                title: "Role",
                                key: "role",
                                render: (role) => role?.name || "",
                            },
                            {
                                title: "Timestamp",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedAdmins}
                        actions={(row) => (
                            <button
                                onClick={() => openEdit(row)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Edit
                            </button>
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
                title={editData ? "Edit Admin User" : "Add Admin User"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                            disabled={!!editData}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Role</label>
                        <select
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        >
                            {roles.map(r => (
                                <option key={r._id} value={r._id}>
                                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {!editData && (
                        <div>
                            <label className="block mb-1 font-medium">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                    )}
                    {editData && (
                        <div>
                            <label className="block mb-1 font-medium">Password (leave blank to keep unchanged)</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )}
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Admin User" : "Create Admin User"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}