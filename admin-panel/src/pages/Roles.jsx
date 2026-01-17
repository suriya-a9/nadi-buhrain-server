import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function Roles() {
    const [rolesList, setRolesList] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [rolesList]);
    const token = localStorage.getItem("token");
    const loadRoles = async () => {
        setLoading(true);
        const res = await api.get("/role/");
        setRolesList(res.data.data);
        setLoading(false);
    };
    useEffect(() => {
        loadRoles();
    }, []);
    const openCreate = () => {
        setForm({ name: "" });
        setEditData(null);
        setOpenCanvas(true);
    };
    const openEdit = (item) => {
        setEditData(item);
        setForm({
            name: item.name,
        });
        setOpenCanvas(true);
    };
    const saveRole = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (editData) payload.id = editData._id;

            const res = await api.post(
                editData ? "/role/update" : "/role/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            setOpenCanvas(false);
            loadRoles();

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Something went wrong"
            );
        }
    };

    const deleteRole = async (id) => {
        try {
            const res = await api.post(
                "/role/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.message);
            loadRoles();

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Something went wrong"
            );
        }
    };
    const totalPages = Math.ceil(rolesList.length /
        ITEMS_PER_PAGE
    );
    const PaginatedRoles = rolesList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Roles List</h2>
                <button
                    onClick={openCreate}
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                >
                    Add Role
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
                                title: "s/no",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "Name", key: "name" },
                            {
                                title: "Timestamp",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={PaginatedRoles}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(row)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteRole(row._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
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
                title={editData ? "Edit Role" : "Add Role"}
            >
                <form onSubmit={saveRole} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Role" : "Create Role"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}