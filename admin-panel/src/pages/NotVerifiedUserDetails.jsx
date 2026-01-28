import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";
import { FaRegIdCard, FaRegAddressCard } from "react-icons/fa6";

export default function NotVerifiedUserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, "");

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await api.post("/account-verify/view", { id });
                if (res.data.data.type === "user") {
                    setUser(res.data.data.user);
                    setAddresses(res.data.data.addresses || []);
                    setFamilyMembers(res.data.data.familyMembers || []);
                    setOwner(res.data.data.parentUser || null);
                } else if (res.data.data.type === "familyMember") {
                    setUser(res.data.data.familyMember);
                    setAddresses(res.data.data.address ? [res.data.data.address] : []);
                    setFamilyMembers([]);
                    setOwner(res.data.data.parentUser || null);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);
    const [owner, setOwner] = useState(null);
    const updateStatus = async (status, reason) => {
        try {
            const payload = { userId: id, status };
            if (status === "rejected" && reason) payload.reason = reason;
            const res = await api.post(
                "/account-verify",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success(res.data.message);
            navigate("/not-verified");
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
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

    return (
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Not Verified User Details</h3>
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500"
                >
                    Back
                </button>
            </div>
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
                        <div><b>Rejection Reason:</b> {user.reason || "—"}</div>
                    </div>
                    {addresses && addresses.length > 0 && (
                        <div>
                            <div className="font-medium mb-2 flex items-center gap-2">
                                <FaRegAddressCard size={20} />
                                <span>Address</span>
                            </div>
                            <div className="bg-white border-2 border-gray-300 rounded-lg shadow p-4 flex flex-col gap-2 max-w-md">
                                {addresses.map((a, idx) => (
                                    <div key={a._id || idx}>
                                        <div><b>City:</b> {a.city || '—'}</div>
                                        <div><b>Building:</b> {a.building || '—'}</div>
                                        <div><b>Floor:</b> {a.floor || '—'}</div>
                                        <div><b>Apt No:</b> {a.aptNo ?? '—'}</div>
                                        <div><b>Block:</b> {a.blockId?.name || a.blockId || '—'}</div>
                                        <div><b>Road:</b> {a.roadId?.name || a.roadId || '—'}</div>
                                        <hr className="my-2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {user.isFamilyMember && owner && (
                        <div className="mb-4 p-3 border rounded bg-gray-50">
                            <div className="font-medium mb-2">Owner Details</div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><b>Full Name:</b> {owner.basicInfo?.fullName || "—"}</div>
                                <div><b>Email:</b> {owner.basicInfo?.email || "—"}</div>
                                <div><b>Mobile:</b> {owner.basicInfo?.mobileNumber || "—"}</div>
                                <div><b>Account Type:</b> {owner.accountTypeId?.name || "—"}</div>
                            </div>
                            {owner.idProofUrl && owner.idProofUrl.length > 0 && (
                                <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-2">Owner ID Proofs</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {owner.idProofUrl.map((f, i) => {
                                            const url = `${API_BASE}/uploads/${f}`;
                                            const ext = f.split('.').pop().toLowerCase();
                                            const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
                                            return (
                                                <div key={i} className="p-2 border rounded bg-white" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                    {isImage && <img src={url} alt={f} className="mt-2 max-h-28 rounded" />}
                                                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all text-sm">
                                                        view
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {!user.isFamilyMember && familyMembers && familyMembers.length > 0 && (
                        <div>
                            <div className="font-medium mb-2">Family Members</div>
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
                                                {fm.idProofUrl && fm.idProofUrl.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {fm.idProofUrl.map((f, i) => {
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
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-span-1">
                    <div className="bg-white border-2 border-gray-300 rounded-lg shadow p-4">
                        <div className="font-medium mb-2 flex items-center gap-2">
                            <FaRegIdCard size={20} />
                            <span>ID Proofs</span>
                        </div>
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
            <div className="mt-6 flex gap-2">
                <button
                    onClick={() => updateStatus("verified")}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    disabled={rejecting}
                >
                    Accept
                </button>
                <button
                    onClick={() => setRejecting(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    disabled={rejecting || user.accountVerification === "rejected"}
                >
                    Reject
                </button>
            </div>
            {rejecting && (
                <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="border rounded px-2 py-1 w-full mb-2"
                        placeholder="Enter reason"
                    />
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            disabled={!reason}
                            onClick={() => updateStatus("rejected", reason)}
                        >
                            Confirm Reject
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 text-black rounded"
                            onClick={() => {
                                setRejecting(false);
                                setReason("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {user.accountVerification === "rejected" && user.reason && (
                <div className="mt-2">
                    <div className="font-medium">Rejection Reason</div>
                    <div className="text-red-600">{user.reason}</div>
                </div>
            )}
        </div>
    );
}