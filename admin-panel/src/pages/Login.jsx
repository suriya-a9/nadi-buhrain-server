import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [remember, setRemember] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/admin/login", form);
            if (remember) {
                localStorage.setItem("token", res.data.token);
            } else {
                sessionStorage.setItem("token", res.data.token);
            }
            login(res.data.token);
            navigate("/");
            toast.success(res.data.message, {
                duration: 2000
            });
        } catch (err) {
            toast.error(err.response?.data?.message, {
                duration: 2000
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex flex-col justify-center w-full lg:w-1/2 p-10">
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Sign In
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block mb-2 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={e => setRemember(e.target.checked)}
                                    className="mr-2"
                                />
                                Remember Me
                            </label>
                            <Link to="/forgot-password" className="text-bgGreen text-sm">
                                Forgot Password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-bgGreen text-white rounded-lg hover:bg-bgGreen"
                        >
                            Sign In
                        </button>
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