import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
    const [step, setStep] = useState(1);
    const [accountTypes, setAccountTypes] = useState([]);
    const [accountTypeId, setAccountTypeId] = useState("");
    const [userId, setUserId] = useState("");
    const [idProofFiles, setIdProofFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [basicInfo, setBasicInfo] = useState({
        fullName: "",
        email: "",
        mobileNumber: "",
        gender: "male",
        password: "",
    });
    const [address, setAddress] = useState({
        city: "",
        building: "",
        floor: "",
        aptNo: "",
        roadId: "",
        blockId: "",
    });
    const [familyCount, setFamilyCount] = useState(1);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [currentFamily, setCurrentFamily] = useState({
        fullName: "",
        relation: "spouse",
        mobile: "",
        email: "",
        gender: "male",
        password: "",
        address: {
            city: "",
            building: "",
            floor: "",
            aptNo: "",
            roadId: "",
            blockId: "",
        }
    });
    const [roads, setRoads] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/account-type").then(res => setAccountTypes(res.data.data));
        api.get("/block").then(res => setBlocks(res.data.data));
    }, []);

    const getRoadsForSelectedBlock = () => {
        const block = blocks.find(b => b._id === address.blockId);
        return block ? block.roads : [];
    };

    const getFamilyRoadsForSelectedBlock = () => {
        const block = blocks.find(b => b._id === currentFamily.address.blockId);
        return block ? block.roads : [];
    };

    const handleAccountType = async (e) => {
        e.preventDefault();
        if (!accountTypeId) return toast.error("Select account type");
        try {
            const res = await api.post("/user-account/", { accountTypeId });
            setUserId(res.data.userId);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const handleBasicInfo = async (e) => {
        e.preventDefault();
        try {
            await api.post("/user-account/basic-info", {
                userId,
                ...basicInfo,
            });
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const handleAddress = async (e) => {
        e.preventDefault();
        try {
            await api.post("/user-account/address", {
                userId,
                address,
            });
            await api.post("/user-account/basic-info", {
                userId,
                ...basicInfo,
                isVerfied: true
            });
            if (getSelectedAccountType()?.type === "FA") {
                setStep(4);
            } else {
                setStep(5);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const handleIdProofUpload = async (e) => {
        e.preventDefault();
        if (!idProofFiles.length) return toast.error("Please select ID proof files");
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("userId", userId);
            idProofFiles.forEach(file => formData.append("idProof", file));
            await api.post("/user-account/upload-id", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("ID proof uploaded");
            setStep(getSelectedAccountType()?.type === "FA" ? 6 : 6);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        } finally {
            setUploading(false);
        }
    };

    const handleAddFamilyMember = async (e) => {
        e.preventDefault();
        try {
            await api.post("/user-account/add-family-member", {
                userId,
                familyCount,
                ...currentFamily,
            });
            setFamilyMembers([...familyMembers, currentFamily]);
            if (familyMembers.length + 1 >= familyCount) {
                setStep(5);
            } else {
                setCurrentFamily({
                    fullName: "",
                    relation: "spouse",
                    mobile: "",
                    email: "",
                    gender: "male",
                    password: "",
                    address: {
                        city: "",
                        building: "",
                        floor: "",
                        aptNo: "",
                        roadId: "",
                        blockId: "",
                    }
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        try {
            await api.post("/user-account/terms-verify", { userId });
            await api.post("/user-account/complete", { userId, isVerfied: true });
            toast.success("User created!");
            navigate("/users");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const getSelectedAccountType = () =>
        accountTypes.find((a) => a._id === accountTypeId);

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-[25px] font-bold mb-6 text-textGreen">Add User</h2>
            {step === 1 && (
                <form onSubmit={handleAccountType} className="space-y-4">
                    <div>
                        <label className="font-medium">Account Type</label>
                        <select
                            value={accountTypeId}
                            onChange={e => setAccountTypeId(e.target.value)}
                            className="border p-2 rounded w-full"
                            required
                        >
                            <option value="">Select</option>
                            {accountTypes.map(a => (
                                <option key={a._id} value={a._id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded">Next</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleBasicInfo} className="space-y-4">
                    <div>
                        <label className="font-medium">Full Name</label>
                        <input name="fullName" value={basicInfo.fullName} onChange={e => setBasicInfo({ ...basicInfo, fullName: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Email</label>
                        <input name="email" type="email" value={basicInfo.email} onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Mobile Number</label>
                        <input name="mobileNumber" value={basicInfo.mobileNumber} onChange={e => setBasicInfo({ ...basicInfo, mobileNumber: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Gender</label>
                        <select name="gender" value={basicInfo.gender} onChange={e => setBasicInfo({ ...basicInfo, gender: e.target.value })} className="border p-2 rounded w-full">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Password</label>
                        <input name="password" type="password" value={basicInfo.password} onChange={e => setBasicInfo({ ...basicInfo, password: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded">Next</button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleAddress} className="space-y-4">
                    <div>
                        <label className="font-medium">City</label>
                        <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Building</label>
                        <input value={address.building} onChange={e => setAddress({ ...address, building: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Floor</label>
                        <input value={address.floor} onChange={e => setAddress({ ...address, floor: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Apt No</label>
                        <input value={address.aptNo} onChange={e => setAddress({ ...address, aptNo: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Block</label>
                        <select
                            value={address.blockId}
                            onChange={e => setAddress({ ...address, blockId: e.target.value, roadId: "" })}
                            className="border p-2 rounded w-full"
                            required
                        >
                            <option value="">Select</option>
                            {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Road</label>
                        <select
                            value={address.roadId}
                            onChange={e => setAddress({ ...address, roadId: e.target.value })}
                            className="border p-2 rounded w-full"
                            required
                            disabled={!address.blockId}
                        >
                            <option value="">Select</option>
                            {getRoadsForSelectedBlock().map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    {getSelectedAccountType()?.type === "FA" && (
                        <div>
                            <label className="font-medium">Family Member Count</label>
                            <input type="number" min={1} value={familyCount} onChange={e => setFamilyCount(Number(e.target.value))} className="border p-2 rounded w-full" required />
                        </div>
                    )}
                    <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded">Next</button>
                </form>
            )}

            {step === 4 && (
                <form onSubmit={handleAddFamilyMember} className="space-y-4">
                    <h3 className="font-semibold">Add Family Member {familyMembers.length + 1} of {familyCount}</h3>
                    <div>
                        <label className="font-medium">Full Name</label>
                        <input value={currentFamily.fullName} onChange={e => setCurrentFamily({ ...currentFamily, fullName: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Relation</label>
                        <select value={currentFamily.relation} onChange={e => setCurrentFamily({ ...currentFamily, relation: e.target.value })} className="border p-2 rounded w-full" required>
                            <option value="spouse">Spouse</option>
                            <option value="daughter">Daughter</option>
                            <option value="son">Son</option>
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Mobile</label>
                        <input value={currentFamily.mobile} onChange={e => setCurrentFamily({ ...currentFamily, mobile: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Email</label>
                        <input value={currentFamily.email} onChange={e => setCurrentFamily({ ...currentFamily, email: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Gender</label>
                        <select value={currentFamily.gender} onChange={e => setCurrentFamily({ ...currentFamily, gender: e.target.value })} className="border p-2 rounded w-full">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Password</label>
                        <input type="password" value={currentFamily.password} onChange={e => setCurrentFamily({ ...currentFamily, password: e.target.value })} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="font-medium">Address</label>
                        <input placeholder="City" value={currentFamily.address.city} onChange={e => setCurrentFamily({ ...currentFamily, address: { ...currentFamily.address, city: e.target.value } })} className="border p-2 rounded w-full mb-1" required />
                        <input placeholder="Building" value={currentFamily.address.building} onChange={e => setCurrentFamily({ ...currentFamily, address: { ...currentFamily.address, building: e.target.value } })} className="border p-2 rounded w-full mb-1" required />
                        <input placeholder="Floor" value={currentFamily.address.floor} onChange={e => setCurrentFamily({ ...currentFamily, address: { ...currentFamily.address, floor: e.target.value } })} className="border p-2 rounded w-full mb-1" required />
                        <input placeholder="Apt No" value={currentFamily.address.aptNo} onChange={e => setCurrentFamily({ ...currentFamily, address: { ...currentFamily.address, aptNo: e.target.value } })} className="border p-2 rounded w-full mb-1" required />
                        <select
                            value={currentFamily.address.blockId}
                            onChange={e => setCurrentFamily({ ...currentFamily, address: { ...currentFamily.address, blockId: e.target.value, roadId: "" } })}
                            className="border p-2 rounded w-full mb-1"
                            required
                        >
                            <option value="">Select Block</option>
                            {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                        <select
                            value={currentFamily.address.roadId}
                            onChange={e => setCurrentFamily({ ...currentFamily, address: { ...currentFamily.address, roadId: e.target.value } })}
                            className="border p-2 rounded w-full"
                            required
                            disabled={!currentFamily.address.blockId}
                        >
                            <option value="">Select Road</option>
                            {getFamilyRoadsForSelectedBlock().map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded">
                        {familyMembers.length + 1 >= familyCount ? "Finish" : "Add Next"}
                    </button>
                </form>
            )}

            {step === 5 && (
                <form onSubmit={handleIdProofUpload} className="space-y-4">
                    <div>
                        <label className="font-medium">Upload ID Proof</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={e => setIdProofFiles(Array.from(e.target.files))}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                    <button type="submit" className="bg-bgGreen text-white px-4 py-2 rounded" disabled={uploading}>
                        {uploading ? "Uploading..." : "Next"}
                    </button>
                </form>
            )}
            {step === 6 && (
                <form onSubmit={handleComplete} className="space-y-4">
                    <div>
                        <label>
                            <input type="checkbox" required /> I accept the terms and conditions
                        </label>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Complete Signup</button>
                </form>
            )}
            <div className="mt-4">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => navigate("/users")}>Cancel</button>
            </div>
        </div>
    );
}