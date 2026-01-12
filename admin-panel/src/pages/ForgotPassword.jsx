import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/admin/forgot-password", { email });
            navigate('/login');
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send reset link");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex flex-col justify-center w-full lg:w-1/2 p-10">
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-bold mb-6">Forgot Password</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        <button className="w-full py-3 bg-bgGreen text-white rounded-lg">
                            Send Reset Link
                        </button>
                        <p className="text-center mt-5">
                            <a className="text-bgGreen ml-1" href="/login">
                                Back to Login
                            </a>
                        </p>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex lg:w-1/2 bg-bgGreen items-center justify-center">
                <img
                    src="/assets/logo.webp"
                    alt="logo"
                    className="w-3/4"
                />
            </div>
        </div>
    );
}