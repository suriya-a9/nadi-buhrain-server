import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../services/api";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const [blocks, setBlocks] = useState([]);
    const [roads, setRoads] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState("");
    const [selectedRoad, setSelectedRoad] = useState("");
    const [loading, setLoading] = useState(true);
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await api.post("/account-verify/view", { id });
                if (res.data.data.user) {
                    setUser(res.data.data.user);
                    setAddresses(res.data.data.addresses || []);
                } else {
                    setUser(res.data.data);
                    setAddresses(res.data.data.addresses || []);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (editMode) {
            api.get("/block").then(res => setBlocks(res.data.data || []));
        }
    }, [editMode]);

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
        if (!user) return;
        const address = (addresses && addresses[0]) || {};
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
                userId: user._id,
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
            navigate("/users");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
            </div>
        );
    }

    if (!user) return <div className="p-6">User not found</div>;

    const address = addresses[0] || {};

    return (
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">User Details</h3>
                <div>
                    {!editMode && (
                        <button onClick={startEdit} className="mr-2 text-sm text-blue-500">Edit</button>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-500"
                    >
                        Back
                    </button>
                </div>
            </div>
            {editMode ? (
                <form
                    onSubmit={handleSubmit(onEditSubmit)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
                >
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
                    <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-2 mt-2">
                        <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded">Save</button>
                        <button type="button" onClick={() => setEditMode(false)} className="text-gray-500 px-4 py-2 rounded border">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><b>Full Name:</b> {user.basicInfo?.fullName || "—"}</div>
                            <div><b>Email:</b> {user.basicInfo?.email || "—"}</div>
                            <div><b>Mobile:</b> {user.basicInfo?.mobileNumber || "—"}</div>
                            <div><b>Gender:</b> {user.basicInfo?.gender || "—"}</div>
                            <div><b>Account Type:</b> {user.accountTypeId?.name || "—"}</div>
                            <div><b>Status:</b> {user.accountVerification || "—"}</div>
                            <div><b>Date & Time:</b> {formatDateTime(user.updatedAt)}</div>
                            <div><b>Points</b> {user.points || "0"}</div>
                        </div>
                        {addresses && addresses.length > 0 && (
                            <div>
                                <div className="font-medium mb-2">Address</div>
                                <div className="bg-white border-2 border-gray-300 rounded-lg shadow p-4 flex flex-col gap-2 max-w-md">
                                    <div><b>City:</b> {addresses[0].city || '—'}</div>
                                    <div><b>Building:</b> {addresses[0].building || '—'}</div>
                                    <div><b>Floor:</b> {addresses[0].floor || '—'}</div>
                                    <div><b>Apt No:</b> {addresses[0].aptNo ?? '—'}</div>
                                    <div><b>Block:</b> {addresses[0].blockId?.name || addresses[0].blockId || '—'}</div>
                                    <div><b>Road:</b> {addresses[0].roadId?.name || addresses[0].roadId || '—'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="col-span-1">
                        <div className="bg-white border-2 border-gray-300 rounded-lg shadow p-4">
                            <div className="font-medium mb-2">ID Proofs</div>
                            {user.idProofUrl && user.idProofUrl.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {user.idProofUrl.map((f, i) => {
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
                            ) : (
                                <div className="text-gray-700">No ID proofs</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}