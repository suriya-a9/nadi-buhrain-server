import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import Table from "../components/Table";
import { BsAward } from "react-icons/bs";
import api from "../services/api";

export default function Dashboard() {
    const [serviceRequests, setServiceRequests] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        technicians: [],
        users: [],
        serviceRequests: [],
        requests: [],
        points: []
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/dashboard/technicians");
            setDashboardData(res.data || { technicians: [], users: [], serviceRequests: [], requests: [], points: [] });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadDashboardData();
        api.get("/user-service-list/")
            .then(res => setServiceRequests(res.data.data || []))
            .catch(() => setServiceRequests([]));
    }, []);

    const getStatusCounts = () => {
        const counts = { Pending: 0, Accepted: 0, Completed: 0, Progress: 0 };
        dashboardData.serviceRequests.forEach(req => {
            switch (req.serviceStatus) {
                case "submitted":
                    counts.Pending++;
                    break;
                case "accepted":
                    counts.Accepted++;
                    break;
                case "completed":
                    counts.Completed++;
                    break;
                case "technicianAssigned":
                case "inProgress":
                    counts.Progress++;
                    break;
                default:
                    break;
            }
        });
        return counts;
    };
    useEffect(() => {
        loadDashboardData();
        api.get("/user-service-list/")
            .then(res => setServiceRequests(res.data.data || []))
            .catch(() => setServiceRequests([]));

        api.get("/inventory/product-list")
            .then(res => {
                setInventory(res.data.data || []);
                const lowStock = (res.data.data || []).filter(item => {
                    const qty = Number(item.quantity);
                    return !isNaN(qty) && qty <= 5;
                });
                setLowStockProducts(lowStock);
            })
            .catch(() => setInventory([]));
    }, []);
    const API_URL = import.meta.env.VITE_API_URL;
    const renderAvatars = (items, type = "technician") => {
        const maxToShow = 3;
        return (
            <div className="flex items-center mt-2">
                {items.slice(0, maxToShow).map((item, idx) => (
                    <img
                        key={item._id || idx}
                        src={
                            type === "technician"
                                ? item.image
                                    ? `${API_URL}/uploads/${item.image}`
                                    : "/assets/admin-logo.webp"
                                : item.basicInfo?.idProofUrl?.[0]
                                    ? `${API_URL}/uploads/${item.basicInfo.idProofUrl[0]}`
                                    : "/assets/admin-logo.webp"
                        }
                        alt="avatar"
                        className="w-[50px] h-[50px] rounded-full border-2 border-white -ml-2 first:ml-0"
                    />
                ))}
                {items.length > maxToShow && (
                    <span className="ml-2 text-gray-500 font-semibold">+{items.length - maxToShow}</span>
                )}
            </div>
        );
    };

    const statusCounts = getStatusCounts();
    const chartData = [
        { name: "Pending", value: statusCounts.Pending },
        { name: "Accepted", value: statusCounts.Accepted },
        { name: "Completed", value: statusCounts.Completed },
        { name: "Progress", value: statusCounts.Progress },
    ];

    return (
        <div className="p-4">
            <h2 className="text-[25px] font-bold mb-6 text-textGreen">Overview</h2>
            {lowStockProducts.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-semibold text-red-700 mb-2">Low Stock Alert</div>
                    <ul className="list-disc pl-5 text-red-800 text-sm">
                        {lowStockProducts.map(product => (
                            <li key={product._id}>
                                <span className="font-medium">{product.productName}</span> — Quantity: <span className="font-bold">{product.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-[35px] h-full">
                    <div className="p-4 sm:p-6 bg-white rounded-[25px] shadow flex flex-col justify-between h-auto sm:h-[215px]">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[20px]">Total<br />Technician</span>
                            <span className="bg-[#6c8fcf] text-white p-2 rounded-[10px] ml-auto">
                                <FaUsers size={22} />
                            </span>
                        </div>
                        {renderAvatars(dashboardData.technicians, "technician")}
                    </div>
                    <div className="p-4 sm:p-6 bg-white rounded-[25px] shadow flex flex-col justify-between h-auto sm:h-[215px]">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[20px]">Verified<br /> Users</span>
                            <span className="bg-[#4ad991] text-white p-2 rounded-[10px] ml-auto">
                                <MdVerifiedUser size={22} />
                            </span>
                        </div>
                        {renderAvatars(dashboardData.users, "user")}
                    </div>
                    <div className="p-4 sm:p-6 bg-white rounded-[25px] shadow flex flex-col justify-between h-auto sm:h-[215px]">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[20px]">Total Requests</span>
                            <span className="bg-[#ffd600] text-white p-2 rounded-[10px] ml-auto">
                                <BsAward size={22} />
                            </span>
                        </div>
                        <div className="mt-2 text-3xl font-bold text-[#0D5F48] text-[80px]">
                            {dashboardData.serviceRequests.length}
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-white rounded-[25px] shadow flex flex-col justify-between h-auto sm:h-[215px]">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[20px]">Total Points Request</span>
                            <span className="bg-[#ffd600] text-white p-2 rounded-[10px] ml-auto">
                                <BsAward size={22} />
                            </span>
                        </div>
                        <div className="mt-2 text-3xl font-bold text-[#0D5F48] text-[80px]">
                            {dashboardData.points.length}
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[25px] shadow p-6 flex flex-col justify-between h-full min-h-[304px]">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-[20px]">Total Service Request</span>
                        <span className="bg-[#ffd600] text-white p-2 rounded-[10px] ml-auto">
                            <VscGitPullRequestGoToChanges size={22} />
                        </span>
                    </div>
                    <div className="w-full h-[250px] sm:h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid vertical={false} stroke="#e0e0e0" />
                                <XAxis dataKey="name" />
                                <Tooltip />
                                <Bar
                                    dataKey="value"
                                    barSize={45}
                                >
                                    {chartData.map((entry, index) => {
                                        const colors = [
                                            "#74BFAB",
                                            "#0D5F48",
                                            "#519C87",
                                            "#85B5A8"
                                        ];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="mt-10 bg-white rounded-[20px] shadow px-6 py-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Recent Service Requests</h2>
                    <button
                        className="bg-[#0D5F48] text-white px-5 py-1 rounded-full text-sm font-semibold"
                        onClick={() => navigate("/new-requests")}
                    >
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="py-2 px-4 font-semibold text-gray-700">Request ID</th>
                                <th className="py-2 px-4 font-semibold text-gray-700">Request By</th>
                                <th className="py-2 px-4 font-semibold text-gray-700">Service Name</th>
                                <th className="py-2 px-4 font-semibold text-gray-700">Status</th>
                                <th className="py-2 px-4 font-semibold text-gray-700">Feedback</th>
                                <th className="py-2 px-4 font-semibold text-gray-700">Scheduled Date</th>
                                <th className="py-2 px-4 font-semibold text-gray-700">Is Urgent?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceRequests.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-gray-400">No new service requests</td>
                                </tr>
                            )}
                            {serviceRequests.slice(-5).reverse().map((req, idx) => (
                                <tr key={req._id} className="border-b border-gray-200">
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        {/* {req.serviceId?.serviceLogo && (
                                        <img
                                            src={`${API_URL}/uploads/${req.serviceId.serviceLogo}`}
                                            alt="logo"
                                            className="w-8 h-8 object-contain rounded-full border"
                                        />
                                    )} */}
                                        <span className="">{req.serviceRequestID}</span>
                                    </td>
                                    <td className="py-3 px-4">{req.userId?.basicInfo?.fullName}</td>
                                    <td className="py-3 px-4">{req.issuesId?.issue || "-"}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${req.serviceStatus === "submitted"
                                                    ? "bg-[#e3f5ef] text-[#0D5F48]"
                                                    : req.serviceStatus === "accepted"
                                                        ? "bg-[#e3eaf5] text-[#0D5F48]"
                                                        : req.serviceStatus === "completed"
                                                            ? "bg-[#e3f5e9] text-[#0D5F48]"
                                                            : "bg-gray-200 text-gray-700"
                                                }
                            `}
                                        >
                                            {req.serviceStatus === "submitted"
                                                ? "Pending"
                                                : req.serviceStatus.charAt(0).toUpperCase() + req.serviceStatus.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{req.feedback || "-"}</td>
                                    <td className="py-3 px-4">{req.scheduleService || "-"}</td>
                                    <td className="py-3 px-4">{req.immediateAssistance ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}