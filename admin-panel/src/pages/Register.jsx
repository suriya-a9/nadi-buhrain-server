import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/register", form);
            alert("Account created!");
            navigate("/login");
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
                        Create an Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block mb-2 font-medium">Name</label>
                            <input
                                type="text"
                                name="name"
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-bgGreen text-white rounded-lg hover:bg-bgGreen"
                        >
                            Sign Up
                        </button>
                    </form>

                    <p className="text-center mt-5">
                        Already have an account?
                        <Link className="text-bgGreen ml-1" to="/login">
                            Sign In
                        </Link>
                    </p>
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