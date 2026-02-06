import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function User() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [accountTypeFilter, setAccountTypeFilter] = useState("");
    const [search, setSearch] = useState("");
    const [blocks, setBlocks] = useState([]);
    const [roads, setRoads] = useState([]);
    const [selectedRoad, setSelectedRoad] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [users]);
    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                "/account-verify/all-user-list",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setUsers(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const toggleUserStatus = async (user) => {
        try {
            const res = await api.post(
                "/account-verify/set-status",
                { id: user._id, status: !user.accountStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            toast.success(res.data.message);
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    useEffect(() => {
        if (detailsOpen) {
            api.get("/block").then(res => setBlocks(res.data.data || []));
        }
    }, [detailsOpen]);
    useEffect(() => {
        if (selectedBlock) {
            const block = blocks.find(b => b._id === selectedBlock);
            setRoads(block?.roads || []);
            if (block && block.roads && !block.roads.find(r => r._id === selectedRoad)) {
                setSelectedRoad("");
            }
        } else {
            setRoads([]);
            setSelectedRoad("");
        }
    }, [selectedBlock, blocks]);
    const filteredUsers = users.filter(s =>
        (statusFilter === "" || (statusFilter === "enabled" && s.accountStatus) || (statusFilter === "disabled" && !s.accountStatus)) &&
        (
            String(s.basicInfo.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.basicInfo.mobileNumber || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.basicInfo.email || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.accountTypeId?.name || "").toLowerCase().includes(search.toLowerCase())
        ) &&
        (
            accountTypeFilter === "" ||
            String(s.accountTypeId?.name || "").toLowerCase() === accountTypeFilter.toLowerCase()
        )
    );

    const deleteUser = async (userId) => {
        toast((t) => (
            <span>
                Are you sure you want to delete this user?<br />
                <button
                    className="bg-red-600 text-white px-3 py-1 rounded mr-2 mt-2"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.post("/user-account/delete-user", { id: userId });
                            toast.success("User deleted successfully");
                            setDetailsOpen(false);
                            setEditMode(false);
                            loadUsers();
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
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <h2 className="text-[20px] sm:text-[25px] font-bold text-textGreen">
                    Users
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
                    <select
                        value={accountTypeFilter}
                        onChange={e => setAccountTypeFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Account Types</option>
                        <option value="Individual Account">Individual Account</option>
                        <option value="Family Account">Family Account</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Status</option>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search users"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-full sm:w-48"
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
                        className="px-3 py-2 bg-bgGreen text-white rounded font-medium w-full sm:w-auto"
                        onClick={() => navigate("/add-user")}
                    >
                        Add User
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
                        Total no of Users: {filteredUsers.length}
                    </div>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * itemsPerPage + idx + 1,
                            },
                            { title: "Full Name", key: "basicInfo.fullName" },
                            { title: "Mobile", key: "basicInfo.mobileNumber" },
                            { title: "Email", key: "basicInfo.email" },
                            { title: "Account Type", key: "accountTypeId.name" },
                            { title: "Status", key: "accountVerification" },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedUsers}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/users/${row._id}`)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => toggleUserStatus(row)}
                                    className={`px-2 py-1 rounded text-sm ${row.accountStatus ? "bg-red-500" : "bg-green-500"} text-white`}
                                >
                                    {row.accountStatus ? "Disable" : "Enable"}
                                </button>
                                <button
                                    onClick={() => deleteUser(row._id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-sm"
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
        </div>
    );
}