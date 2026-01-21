import { useState, useEffect } from "react";
import api from "../services/api";
import Offcanvas from "../components/Offcanvas";
import Table from "../components/Table";
import { formatDateTime } from "../utils/dateUtils";

export default function Points() {
    const [points, setPoints] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({
        points: "",
        accountType: ""
    });
    const [accountTypes, setAccountTypes] = useState([]);
    const loadPoints = async () => {
        const res = await api.get("/points");
        setPoints(res.data.data);
    };

    const loadAccountTypes = async () => {
        const res = await api.get("/account-type");
        setAccountTypes(res.data.data);
    };

    useEffect(() => {
        loadPoints();
        loadAccountTypes();
    }, []);
    const token = localStorage.getItem("token");
    const openCreate = () => {
        setForm({
            points: "",
            accountType: ""
        });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (point) => {
        setEditData(point);
        setForm({
            points: point.points,
            accountType: point.accountType?._id || point.accountType
        });
        setOpenCanvas(true);
    };
    const savePoints = async (e) => {
        e.preventDefault();
        if (editData) {
            await api.post("/points/update", {
                id: editData._id,
                points: form.points,
                accountType: form.accountType
            });
        } else {
            await api.post("/points/add", form);
        }
        setOpenCanvas(false);
        loadPoints();
    };
    const deletePoints = async (id) => {
        await api.post("/points/delete", { id });
        loadPoints();
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Points List</h2>
            </div>
            <Table
                columns={[
                    { title: "Points", key: "points" },
                    { title: "Account type", key: "accountType.name" },
                    {
                        title: "Date & Time",
                        key: "updatedAt",
                        render: (_, row) => formatDateTime(row.updatedAt)
                    },
                ]}
                data={points}
                actions={(row) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEdit(row)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deletePoints(row._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                            Delete
                        </button>
                    </div>
                )}
            />

            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit Points" : "Add Points"}
            >
                <form onSubmit={savePoints} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Points</label>
                        <input
                            type="number"
                            value={form.points}
                            onChange={(e) => setForm({ ...form, points: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Account Type</label>
                        <select
                            value={form.accountType}
                            onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">Select Account Type</option>
                            {accountTypes.map((type) => (
                                <option key={type._id} value={type._id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Points" : "Create Points"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}