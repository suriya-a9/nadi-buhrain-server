import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const ALL_PERMISSIONS = [
    "dashboard",
    "admin-list",
    "service-requests",
    "services",
    "users",
    "technicians",
    "address",
    "points",
    "inventory",
    "Settings",
    "user-logs"
];

export default function RoleManager() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        api.get("/role/").then(res => setRoles(res.data.data));
    }, []);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions || []);
    };

    const handlePermissionChange = (perm) => {
        setSelectedPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        await api.post(
            "/role/update",
            { id: selectedRole._id, permissions: selectedPermissions },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const res = await api.get("/role/");
        setRoles(res.data.data);

        const updatedRole = res.data.data.find(r => r._id === selectedRole._id);
        setSelectedRole(updatedRole);

        setSaving(false);
        toast.success("Permissions updated!");
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white rounded-xl shadow-lg mt-4 sm:mt-8">
            <h2 className="text-[25px] font-bold mb-6 text-textGreen">Role Permissions Management</h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="w-full md:w-1/3">
                    <h3 className="font-semibold mb-4 text-lg text-gray-700">Roles</h3>
                    <ul className="space-y-2">
                        {roles.map(role => (
                            <li key={role._id}>
                                <button
                                    className={`w-full text-left px-4 py-3 rounded-lg transition font-medium border 
                                        ${selectedRole?._id === role._id
                                            ? "bg-bgGreen text-white border-bgGreen shadow"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-bgGreen/10"
                                        }`}
                                    onClick={() => handleRoleSelect(role)}
                                >
                                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {selectedRole && (
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <h3 className="font-semibold text-lg text-gray-700">
                                Permissions for <span className="text-bgGreen">{selectedRole.name}</span>
                            </h3>
                            <button
                                className="px-4 py-2 rounded bg-bgGreen text-white font-semibold shadow hover:bg-green-700 transition"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            {ALL_PERMISSIONS.map(perm => (
                                <label
                                    key={perm}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer
                                        ${selectedPermissions.includes(perm)
                                            ? "bg-bgGreen/10 border-bgGreen"
                                            : "bg-gray-50 border-gray-200 hover:border-bgGreen"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="accent-bgGreen w-5 h-5"
                                        checked={selectedPermissions.includes(perm)}
                                        onChange={() => handlePermissionChange(perm)}
                                    />
                                    <span className="capitalize text-gray-800">{perm.replace(/-/g, " ")}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}