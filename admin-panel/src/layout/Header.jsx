import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { IoIosNotificationsOutline } from "react-icons/io";
import { io } from "socket.io-client";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import api from "../services/api";

export default function Header({ toggleSidebar }) {
    const { logout, name, role } = useAuth();
    const [openMenu, setOpenMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const socketRef = useRef(null);
    const loadNotifications = async () => {
        const res = await api.get("/notifications");
        setNotifications(res.data.data);
    };
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        loadNotifications();
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_API_URL);
            socketRef.current.on('notification', (data) => {
                setNotifications((prev) => [data, ...prev]);
            });
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const markAsRead = async (id) => {
        await api.post(`/notifications/mark-read/${id}`);
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
    };

    const removeNotification = async (id) => {
        await api.post(`/notifications/clear-notification/${id}`);
        setNotifications((prev) =>
            prev.filter((n) => n._id !== id)
        );
    };

    const clearAll = async () => {
        await api.post("/notifications/clear");
        setNotifications([]);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }

            if (
                profileRef.current &&
                !profileRef.current.contains(e.target)
            ) {
                setOpenMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-[#F3F3F3] shadow h-16 flex items-center px-4 justify-between">
            <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded hover:bg-gray-100"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <h1 className="text-xl font-semibold"> </h1>

            <div className="relative flex items-center" ref={notificationRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 rounded-full bg-white"
                >
                    <span className="material-icons"><IoIosNotificationsOutline size={25} /></span>
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-0 right-0 bg-[#B1B1B1] text-white rounded-full pl-2 pr-2 pt-1 pb-1 text-[8px]">
                            {notifications.filter(n => !n.read).length}
                        </span>
                    )}
                </button>
                {showDropdown && (
                    <div className="absolute right-0 top-[35px] h-[500px] overflow-y-scroll mt-2 w-80 bg-white rounded shadow-md py-2 z-50" id="notification">
                        <div className="flex justify-between items-center px-4 py-2">
                            <h3 className="font-semibold">Notifications</h3>
                            <button
                                onClick={clearAll}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Clear All
                            </button>
                        </div>
                        <ul>
                            {notifications.length === 0 ? (
                                <li className="px-4 py-2 text-gray-500">No notifications</li>
                            ) : (
                                notifications.map((n, idx) => (
                                    <li
                                        key={n._id || idx}
                                        className={`flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 ${n.read ? "text-gray-400" : ""}`}
                                    >
                                        <div>
                                            <div className="font-medium">{n.message}</div>
                                            <div className="text-xs text-gray-400">{new Date(n.time).toLocaleString()}</div>
                                        </div>
                                        {!n.read && (
                                            <button
                                                onClick={() => markAsRead(n._id)}
                                                className="ml-2 text-blue-500 hover:text-green-600"
                                                title="Mark as read"
                                            >
                                                <MdDone size={20} title="mark as read" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeNotification(n._id)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                            title="Remove notification"
                                        >
                                            <RxCross2 size={18} title="remove notification" />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setOpenMenu(!openMenu)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                    >
                        <img
                            src="/assets/admin-logo.webp"
                            alt="avatar"
                            className="w-9 h-9 rounded-full"
                        />

                        <div className="text-left leading-tight">
                            <p className="text-sm font-semibold">
                                {name || "Admin"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {role || "Administrator"}
                            </p>
                        </div>

                        <svg
                            className={`w-4 h-4 transition-transform ${openMenu ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openMenu && (
                        <div className="absolute right-0 top-[55px] w-40 bg-white rounded shadow-md py-2">
                            <button
                                onClick={() => {
                                    logout();
                                    window.location.href = "/login";
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}