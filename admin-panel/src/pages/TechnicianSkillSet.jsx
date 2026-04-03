import { useEffect, useState } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function TechnicianSkills() {
    const [technicianSkill, setTechnicianSkill] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        skill: "",
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [technicianSkill]);
    const token = localStorage.getItem("token");
    const loadTechnicianSkill = async () => {
        try {
            setLoading(true);
            const res = await api.get("/technical/admin-list");
            setTechnicianSkill(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    useEffect(() => {
        loadTechnicianSkill();
    }, []);
    const openCreate = () => {
        setForm({
            skill: "",
        });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            skill: item.skill,
        });
        setOpenCanvas(true);
    };
    const saveTechnicianSkill = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        if (editData) payload.id = editData._id;
        try {
            const res = await api.post(
                editData ? "/technical/update" : "/technical/add",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            setOpenCanvas(false);
            loadTechnicianSkill();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const deleteTechnicianSkill = async (id) => {
        try {
            const res = await api.post(
                "/technical/delete",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadTechnicianSkill();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };
    const filteredTechnician = technicianSkill.filter(s =>
        String(s.skill || "").toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredTechnician.length / itemsPerPage);

    const paginatedTechnicianSkill = filteredTechnician.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const toggleSkillStatus = async (item) => {
        try {
            await api.post(
                "/technical/status-toggle",
                { skillId: item._id, status: !item.status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Skill status updated");
            loadTechnicianSkill();
        } catch (err) {
            toast.error("Failed to update skill status");
        }
    };
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Technician Skill Set</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Search skills"
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
                        onClick={openCreate}
                        className="bg-bgGreen text-white px-4 py-2 rounded"
                    >
                        Add Skill
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
                        Total no of Technicians skills: {filteredTechnician.length}
                    </div>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * itemsPerPage + idx + 1,
                            },
                            { title: "Skill", key: "skill" },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedTechnicianSkill}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(row)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteTechnicianSkill(row._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => toggleSkillStatus(row)}
                                    className={`px-3 py-1 rounded text-white ${row.status ? "bg-red-600" : "bg-green-600"}`}
                                >
                                    {row.status ? "Disable" : "Enable"}
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
                title={editData ? "Edit Skill" : "Add Skill"}
            >
                <form onSubmit={saveTechnicianSkill} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Skill</label>
                        <input
                            type="text"
                            value={form.skill}
                            onChange={(e) => setForm({ ...form, skill: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Skill" : "Create Skill"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    )
}