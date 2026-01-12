import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { RiAccountBoxLine } from "react-icons/ri";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineEmail, MdFamilyRestroom } from "react-icons/md";
import { LiaPhoneSquareSolid } from "react-icons/lia";
import { BsGenderAmbiguous } from "react-icons/bs";
import { FaRegAddressCard, FaRegIdCard } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function User() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [blocks, setBlocks] = useState([]);
    const [roads, setRoads] = useState([]);
    const [selectedRoad, setSelectedRoad] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("");
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");
    useEffect(() => {
        setCurrentPage(1);
    }, [users]);
    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/account-verify/all-user-list");
            setUsers(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = async (id) => {
        try {
            const res = await api.post("/account-verify/view", { id });
            setSelectedUser(res.data.data);
            setEditMode(false);
            setDetailsOpen(true);
        } catch (err) {
            toast.error(err.response?.data?.message);
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

    const renderIdProofs = (files = []) => {
        if (!files || !files.length) return <div className="text-gray-700">No ID proofs</div>;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((f, i) => {
                    const url = `${API_BASE}/uploads/${f}`;
                    const ext = f.split('.').pop().toLowerCase();
                    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
                    return (
                        <div key={i} className="p-2 border rounded bg-gray-50" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            {isImage && <div className="mt-2"><img src={url} alt={f} className="max-h-40 w-auto rounded" /></div>}
                            <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                                view
                            </a>
                        </div>
                    );
                })}
            </div>
        );
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
    const startEdit = () => {
        if (!selectedUser) return;
        const user = getUserDoc(selectedUser);
        const address = (selectedUser.addresses && selectedUser.addresses[0]) || {};
        const blockId = address.blockId?._id || address.blockId || "";
        const roadId = address.roadId?._id || address.roadId || "";
        setSelectedBlock(blockId);
        setSelectedRoad(roadId);
        reset({
            fullName: user.basicInfo?.fullName || "",
            email: user.basicInfo?.email || "",
            mobileNumber: user.basicInfo?.mobileNumber || "",
            gender: user.basicInfo?.gender || "",
            city: address.city || "",
            building: address.building || "",
            floor: address.floor || "",
            aptNo: address.aptNo || "",
            block: blockId,
            road: roadId,
        });
        setEditMode(true);
    };
    const onEditSubmit = async (data) => {
        try {
            await api.post("/user-account/profile-update", {
                userId: getUserDoc(selectedUser)._id,
                basicInfo: {
                    fullName: data.fullName,
                    email: data.email,
                    mobileNumber: data.mobileNumber,
                    gender: data.gender,
                },
                address: {
                    city: data.city,
                    building: data.building,
                    floor: data.floor,
                    aptNo: data.aptNo,
                    blockId: selectedBlock,
                    roadId: selectedRoad,
                },
            });
            toast.success("User updated");
            setEditMode(false);
            setDetailsOpen(false);
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const getUserDoc = (selected) => {
        if (!selected) return null;
        return selected.user || selected;
    };
    const filteredUsers = users.filter(s =>
        (statusFilter === "" || (statusFilter === "enabled" && s.accountStatus) || (statusFilter === "disabled" && !s.accountStatus)) &&
        (
            String(s.basicInfo.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.basicInfo.mobileNumber || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.basicInfo.email || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.accountTypeId?.name || "").toLowerCase().includes(search.toLowerCase())
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
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-[25px] font-bold mb-6 text-textGreen">Users</h2>
                <div className="flex gap-2 flex-1 md:justify-end">
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
                        className="border p-2 rounded w-48"
                    />
                    <button
                        className="px-3 py-2 bg-bgGreen text-white rounded font-medium"
                        onClick={() => navigate("/add-user")}
                    >
                        Add User
                    </button>
                </div>
            </div>

            <Table
                columns={[
                    {
                        title: "s/no",
                        key: "sno",
                        render: (_, __, idx) =>
                            (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                    },
                    { title: "Full Name", key: "basicInfo.fullName" },
                    { title: "Mobile", key: "basicInfo.mobileNumber" },
                    { title: "Email", key: "basicInfo.email" },
                    { title: "Account Type", key: "accountTypeId.name" },
                    { title: "Status", key: "accountVerification" },
                ]}
                data={paginatedUsers}
                actions={(row) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => viewDetails(row._id)}
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
            {loading && <div className="text-sm text-gray-500 mt-2">Loading...</div>}

            {detailsOpen && selectedUser && (() => {
                const isUser = selectedUser.type === 'user';
                const user = getUserDoc(selectedUser);
                if (!user) return null;
                const familyMembers = isUser ? (selectedUser.familyMembers || []) : [];

                const owner = user.familyOwnerId && typeof user.familyOwnerId === "object" ? user.familyOwnerId : null;
                const ownerId = owner ? owner._id : (user.familyOwnerId || null);

                return (
                    <div className="fixed inset-0 z-50 overflow-auto">
                        <div className="min-h-screen flex items-start justify-center py-8 px-4">
                            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setDetailsOpen(false)} />
                            <div className="relative bg-white text-black p-6 rounded shadow-lg max-w-4xl w-full z-10 max-h-[90vh] overflow-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">User Details</h3>
                                    <div>
                                        {!editMode && (
                                            <button onClick={startEdit} className="mr-2 text-sm text-blue-500">Edit</button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setDetailsOpen(false);
                                                setEditMode(false);
                                            }}
                                            className="text-sm text-gray-500"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>

                                {editMode ? (
                                    <form onSubmit={handleSubmit(onEditSubmit)} className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block text-xs mb-1">Full Name</label>
                                            <input {...register("fullName")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Email</label>
                                            <input {...register("email")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Mobile</label>
                                            <input {...register("mobileNumber")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Gender</label>
                                            <select {...register("gender")} className="border p-2 rounded w-full">
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="others">Others</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">City</label>
                                            <input {...register("city")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Building</label>
                                            <input {...register("building")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Floor</label>
                                            <input {...register("floor")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Apt No</label>
                                            <input {...register("aptNo")} className="border p-2 rounded w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Block</label>
                                            <select
                                                {...register("block")}
                                                className="border p-2 rounded w-full"
                                                value={selectedBlock}
                                                onChange={e => setSelectedBlock(e.target.value)}
                                            >
                                                <option value="">Select Block</option>
                                                {blocks.map(b => (
                                                    <option key={b._id} value={b._id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1">Road</label>
                                            <select
                                                {...register("road")}
                                                className="border p-2 rounded w-full"
                                                value={selectedRoad}
                                                onChange={e => setSelectedRoad(e.target.value)}
                                            >
                                                <option value="">Select Road</option>
                                                {roads.map(r => (
                                                    <option key={r._id} value={r._id}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2 flex gap-2 mt-2">
                                            <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded">Save</button>
                                            <button type="button" onClick={() => setEditMode(false)} className="text-gray-500 px-4 py-2 rounded border">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {user.isFamilyMember && (
                                            <div className="mb-4 p-3 border rounded bg-gray-50">
                                                <div className="text-xs text-gray-500">Belongs to</div>
                                                <div className="text-sm font-medium">{owner ? owner.basicInfo?.fullName : `Owner ID: ${ownerId}`}</div>
                                                <div className="text-sm text-gray-600">{owner ? owner.basicInfo?.email : null}</div>
                                                <div className="text-sm text-gray-600">{owner ? owner.basicInfo?.mobileNumber : null}</div>

                                                {owner && owner.idProofUrl && owner.idProofUrl.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="text-xs text-gray-500 mb-2">Owner ID Proofs</div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {owner.idProofUrl.map((f, i) => {
                                                                const url = `${API_BASE}/uploads/${f}`;
                                                                const ext = f.split('.').pop().toLowerCase();
                                                                const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
                                                                return (
                                                                    <div key={i} className="p-2 border rounded bg-white" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                                        {isImage && <img src={url} alt={f} className="mt-2 max-h-28 rounded" />}
                                                                        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all text-sm">view</a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="col-span-2 space-y-4">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium"><RiAccountBoxLine size={25} /></div>
                                                        <div className="text-gray-700">{user.accountTypeId?.name || "—"}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium"><FaRegUserCircle size={25} /></div>
                                                        <div className="text-gray-700">{user.basicInfo?.fullName || "—"}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium"><MdOutlineEmail size={25} /></div>
                                                        <div className="text-gray-700">{user.basicInfo?.email || "—"}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium"><LiaPhoneSquareSolid size={25} /></div>
                                                        <div className="text-gray-700">{user.basicInfo?.mobileNumber || "—"}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium"><BsGenderAmbiguous size={25} /></div>
                                                        <div className="text-gray-700">{user.basicInfo?.gender || "—"}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">Signup Completed</div>
                                                        <div className="text-gray-700">{user.singnUpCompleted ? "Yes" : "No"}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">Verification</div>
                                                        <div className="text-gray-700">{user.accountVerification || "—"}</div>
                                                    </div>
                                                </div>

                                                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                                    <div>
                                                        <div className="font-medium mb-2 flex items-center gap-2">
                                                            <FaRegAddressCard size={25} />
                                                            <span>Address</span>
                                                        </div>
                                                        <div className="bg-white border-2 border-gray-300 rounded-lg shadow p-4 flex flex-col gap-2 max-w-md">
                                                            {selectedUser.addresses.map((a) => {
                                                                const roadName = a.roadId && typeof a.roadId === "object" ? a.roadId.name : a.roadId;
                                                                const blockName = a.blockId && typeof a.blockId === "object" ? a.blockId.name : a.blockId;
                                                                return (
                                                                    <div key={a._id} className="flex flex-col gap-1">
                                                                        <div className="flex gap-2">
                                                                            <span className="font-semibold">Road:</span>
                                                                            <span>{roadName || '—'}</span>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span className="font-semibold">Block:</span>
                                                                            <span>{blockName || '—'}</span>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span className="font-semibold">City:</span>
                                                                            <span>{a.city || '—'}</span>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span className="font-semibold">Building:</span>
                                                                            <span>{a.building || '—'}</span>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span className="font-semibold">Floor:</span>
                                                                            <span>{a.floor || '—'}</span>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span className="font-semibold">Apt No:</span>
                                                                            <span>{a.aptNo ?? '—'}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="font-medium mb-2 flex items-center gap-2">
                                                        <MdFamilyRestroom size={25} />
                                                        <span>Family Members</span>
                                                    </div>
                                                    {familyMembers.length === 0 ? (
                                                        <div className="text-gray-700 text-sm">No family members</div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {familyMembers.map((fm) => (
                                                                <div key={fm._id} className="p-3 border rounded bg-gray-50">
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div>
                                                                            <div className="text-xs text-gray-500">Name</div>
                                                                            <div className="text-gray-800">{fm.fullName}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-500">Relation</div>
                                                                            <div className="text-gray-800">{fm.relation}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-500">Email</div>
                                                                            <div className="text-gray-800">{fm.email}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-500">Mobile</div>
                                                                            <div className="text-gray-800">{fm.mobile}</div>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <div className="text-xs text-gray-500">Address</div>
                                                                            {fm.address ? (
                                                                                <div className="text-gray-800 text-sm">
                                                                                    {fm.address.city ? `${fm.address.city}, ` : ''}
                                                                                    {fm.address.building ? `${fm.address.building}, ` : ''}
                                                                                    {fm.address.street ? `${fm.address.street}, ` : ''}
                                                                                    Apt: {fm.address.aptNo ?? '—'} Floor: {fm.address.floor ?? '—'}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-gray-700">No address</div>
                                                                            )}
                                                                        </div>
                                                                        <div className="col-span-2 mt-2">
                                                                            <div className="text-xs text-gray-500">Family Member ID Proofs</div>
                                                                            {fm.idProofUrl ? renderIdProofs(fm.idProofUrl) : <div className="text-gray-700">No ID proofs</div>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="bg-white border-2 border-gray-300 rounded-lg shadow p-4">
                                                    <div className="font-medium mb-2 flex items-center gap-2">
                                                        <FaRegIdCard size={25} />
                                                        <span>ID Proofs</span>
                                                    </div>
                                                    {renderIdProofs(user.idProofUrl)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}