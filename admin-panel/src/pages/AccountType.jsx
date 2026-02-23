import { useEffect, useState } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function AccountType() {
    const [accountList, setAccountList] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({
        name_ar: "",
        name_en: "",
        type: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [accountList]);
    const token = localStorage.getItem("token");

    const loadAccountList = async () => {
        try {
            const res = await api.get("/account-type/");
            setAccountList(res.data.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        loadAccountList();
    }, []);

    const openCreate = () => {
        setForm({ name_ar: "", name_en: "", type: "" });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            name_ar: item.name_ar,
            name_en: item.name_en,
            type: item.type
        });
        setOpenCanvas(true);
    };

    const saveAccountType = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        if (editData) payload.id = editData._id;

        try {
            const res = await api.post(
                editData ? "/account-type/update" : "/account-type/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || "Saved successfully");
            setOpenCanvas(false);
            loadAccountList();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };

    const deleteAccountType = async (id) => {
        try {
            const res = await api.post(
                "/account-type/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || "Deleted successfully");
            loadAccountList();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete account type");
        }
    };

    const totalPages = Math.ceil(accountList.length / ITEMS_PER_PAGE);

    const paginatedAccountType = accountList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Account Types List</h2>
                <button
                    onClick={openCreate}
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                >
                    Add Account Type
                </button>
            </div>
            <Table
                columns={[
                    {
                        title: "S.No",
                        key: "sno",
                        render: (_, __, idx) =>
                            (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                    },
                    { title: "Name (EN)", key: "name_en" },
                    { title: "Name (AR)", key: "name_ar" },
                    { title: "Type", key: "type" },
                ]}
                data={paginatedAccountType}
                actions={(row) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEdit(row)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteAccountType(row._id)}
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
            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit Account Type" : "Add Account Type"}
            >
                <form onSubmit={saveAccountType} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Name (en)</label>
                        <input
                            type="text"
                            value={form.name_en}
                            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                        <label className="block mb-1 font-medium">Name (ar)</label>
                        <input
                            type="text"
                            value={form.name_ar}
                            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                        <label className="block mb-1 font-medium">Type</label>
                        <input
                            type="text"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Account Type" : "Create Account Type"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}