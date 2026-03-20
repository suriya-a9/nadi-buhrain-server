import { useState, useEffect } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

export default function Gift() {
    const [gifts, setGifts] = useState([]);
    const [users, setUsers] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(gifts.length / itemsPerPage);

    const paginatedData = gifts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    useEffect(() => {
        setCurrentPage(1);
    }, [gifts]);

    const [mode, setMode] = useState("view");
    const [viewData, setViewData] = useState(null);

    const [form, setForm] = useState({
        title: "",
        caption: "",
        totalPoints: "",
        allowedAccountTypes: [],
        targetUserIds: []
    });

    const token = localStorage.getItem("token");

    const loadGifts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/gift/list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGifts(res.data.data || []);
        } catch {
            toast.error("Failed to load gifts");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadGifts();

        api.get("/account-type/")
            .then(res => setAccountTypes(res.data.data))
            .catch(() => setAccountTypes([]));

        api.get("/account-verify/all-user-list")
            .then(res => setUsers(res.data.data))
            .catch(() => setUsers([]));
    }, []);

    const openCreate = () => {
        setMode("add");
        setViewData(null);
        setForm({
            title: "",
            caption: "",
            totalPoints: "",
            allowedAccountTypes: [],
            targetUserIds: []
        });
        setOpenCanvas(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                totalPoints: Number(form.totalPoints)
            };

            await api.post("/gift/add", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Gift added successfully");
            setOpenCanvas(false);
            loadGifts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Gift</h2>
                <button
                    onClick={openCreate}
                    className="bg-bgGreen text-white px-4 py-2 rounded"
                >
                    Send Gift
                </button>
            </div>
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
            <div className="mb-2 text-left text-sm text-gray-600">
                Total no of Gifts: {gifts.length}
            </div>
            <Table
                columns={[
                    { title: "Title", key: "title" },
                    { title: "Points", key: "totalPoints" },
                ]}
                data={paginatedData}
                loading={loading}
                actions={(row) => (
                    <button
                        onClick={() => {
                            setMode("view");
                            setViewData(row);
                            setOpenCanvas(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        View
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
            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={mode === "view" ? "Gift Details" : "Send Gift"}
            >
                {mode === "view" && viewData && (
                    <div className="space-y-4">

                        <div>
                            <label className="font-medium">Title</label>
                            <div className="border p-2 rounded bg-gray-100">
                                {viewData.title}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium">Caption</label>
                            <div className="border p-2 rounded bg-gray-100">
                                {viewData.caption || "-"}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium">Total Points</label>
                            <div className="border p-2 rounded bg-gray-100">
                                {viewData.totalPoints}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium">Account Types</label>
                            <div className="border p-2 rounded bg-gray-100">
                                {viewData.allowedAccountTypes?.length
                                    ? accountTypes
                                        .filter(type =>
                                            viewData.allowedAccountTypes.includes(type._id)
                                        )
                                        .map(t => t.name_en)
                                        .join(", ")
                                    : "All"}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium">Users</label>
                            <div className="border p-2 rounded bg-gray-100 max-h-40 overflow-y-auto">
                                {viewData.targetUserIds?.length
                                    ? users
                                        .filter(u =>
                                            viewData.targetUserIds.includes(u._id)
                                        )
                                        .map(u => u.basicInfo?.fullName)
                                        .join(", ")
                                    : "All Users"}
                            </div>
                        </div>
                    </div>
                )}

                {mode === "add" && (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <input
                            placeholder="Title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />

                        <input
                            placeholder="Caption"
                            value={form.caption}
                            onChange={e => setForm({ ...form, caption: e.target.value })}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            type="number"
                            placeholder="Points"
                            value={form.totalPoints}
                            onChange={e => setForm({ ...form, totalPoints: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />

                        <div className="relative">
                            <label className="font-medium">Account Types</label>

                            <div
                                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                className="border p-2 rounded cursor-pointer bg-white"
                            >
                                {form.allowedAccountTypes.length
                                    ? accountTypes
                                        .filter(t => form.allowedAccountTypes.includes(t._id))
                                        .map(t => t.name_en)
                                        .join(", ")
                                    : "Select Account Types"}
                            </div>

                            {showAccountDropdown && (
                                <div className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto rounded shadow">
                                    {accountTypes.map(type => (
                                        <div
                                            key={type._id}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                let updated = [...form.allowedAccountTypes];

                                                if (updated.includes(type._id)) {
                                                    updated = updated.filter(id => id !== type._id);
                                                } else {
                                                    updated.push(type._id);
                                                }

                                                setForm({
                                                    ...form,
                                                    allowedAccountTypes: updated,
                                                    targetUserIds: []
                                                });
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.allowedAccountTypes.includes(type._id)}
                                                readOnly
                                            />
                                            {type.name_en}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <label className="font-medium">Users</label>

                            <div
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="border p-2 rounded cursor-pointer bg-white"
                            >
                                {form.targetUserIds.length
                                    ? users
                                        .filter(u => form.targetUserIds.includes(u._id))
                                        .map(u => u.basicInfo?.fullName)
                                        .join(", ")
                                    : "Select Users"}
                            </div>

                            {showUserDropdown && (
                                <div className="absolute z-10 bg-white border w-full max-h-48 overflow-y-auto rounded shadow">
                                    {users.map(user => (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                let updated = [...form.targetUserIds];

                                                if (updated.includes(user._id)) {
                                                    updated = updated.filter(id => id !== user._id);
                                                } else {
                                                    updated.push(user._id);
                                                }

                                                setForm({
                                                    ...form,
                                                    targetUserIds: updated,
                                                    allowedAccountTypes: []
                                                });
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.targetUserIds.includes(user._id)}
                                                readOnly
                                            />
                                            {user.basicInfo?.fullName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="w-full bg-bgGreen text-white py-2 rounded">
                            Save Gift
                        </button>
                    </form>
                )}
            </Offcanvas>
        </div>
    );
}