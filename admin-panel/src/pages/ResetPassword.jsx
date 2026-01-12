import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post(`/admin/reset-password/${token}`, { password });
            toast.success(res.data.message);
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.message;

            if (msg?.toLowerCase().includes("expired") || msg?.toLowerCase().includes("invalid")) {
                setExpired(true);
            }

            toast.error(msg || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    const resendLink = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/admin/forgot-password", { email });
            toast.success(res.data.message);
            setExpired(false);
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex flex-col justify-center w-full lg:w-1/2 p-10">
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-bold mb-6">
                        {expired ? "Link Expired" : "Reset Password"}
                    </h2>

                    {!expired ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-3 bg-bgGreen text-white rounded-lg"
                            >
                                Reset Password
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={resendLink} className="space-y-5">
                            <p className="text-sm text-gray-600">
                                Your reset link has expired. Enter your email to receive a new one.
                            </p>

                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-3 bg-bgGreen text-white rounded-lg"
                            >
                                Resend Reset Link
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-bgGreen items-center justify-center">
                <img src="/assets/logo.webp" alt="logo" className="w-3/4" />
            </div>
        </div>
    );
}