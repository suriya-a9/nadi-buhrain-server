import { useEffect, useState } from "react";
import api from "../services/api";
import Chat from "./Chat";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_URL);

export default function AdminChatList() {
    const { id } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [unreadMap, setUnreadMap] = useState({});
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get("/admin/list").then(res => {
            setAdmins(res.data.data.filter(a => a._id !== id));
        });
    }, [id]);

    if (!id) return null;

    useEffect(() => {
        socket.on("receive_message", (msg) => {
            if (msg.to !== id) return;
            if (selectedAdmin?._id !== msg.from) {
                setUnreadMap(prev => ({
                    ...prev,
                    [msg.from]: true
                }));
            }
        });
        return () => {
            socket.off("receive_message");
        };
    }, [id, selectedAdmin]);

    useEffect(() => {
        if (!id) return;
        api.get("/admin/list").then(res => {
            setAdmins(res.data.data.filter(a => a._id !== id));
        });
        api.get(`/chat/unread?userId=${id}`).then(res => {
            const unread = {};
            res.data.forEach(msg => {
                unread[msg.from] = true;
            });
            setUnreadMap(unread);
        });
    }, [id]);

    return (
        <div className="h-screen bg-gray-50 flex flex-col md:flex-row">
            <div className={`
                fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden
                ${showSidebar ? "block" : "hidden"}
            `} onClick={() => setShowSidebar(false)} />
            <aside className={`
                w-80 bg-white flex flex-col border-r z-50
                fixed top-0 left-0 h-full transition-transform duration-300
                ${showSidebar ? "translate-x-0" : "-translate-x-full"}
                md:static md:translate-x-0 md:flex
            `}>
                <div className="px-4 py-4 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Admin Chat
                        </h2>
                        <p className="text-xs text-gray-400">
                            Internal communication
                        </p>
                    </div>
                    <button
                        className="md:hidden p-2"
                        onClick={() => setShowSidebar(false)}
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {admins.map(admin => {
                        const isActive = selectedAdmin?._id === admin._id;
                        return (
                            <button
                                key={admin._id}
                                onClick={async () => {
                                    setSelectedAdmin(admin);
                                    setShowSidebar(false);
                                    setUnreadMap(prev => ({
                                        ...prev,
                                        [admin._id]: false
                                    }));
                                    await api.post("/chat/mark-read", {
                                        from: admin._id,
                                        to: id
                                    });
                                    socket.emit("mark_read", { userId: id });
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition
                                    ${isActive
                                        ? "bg-bgGreen/10 border border-bgGreen/30"
                                        : "hover:bg-gray-100"
                                    }
                                `}
                            >
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-bgGreen/20 flex items-center justify-center font-semibold text-bgGreen">
                                        {admin.name?.charAt(0).toUpperCase()}
                                    </div>
                                    {unreadMap[admin._id] && (
                                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bgGreen ring-2 ring-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate">
                                        {admin.name}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {admin.email}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>
            <main className="flex-1 flex flex-col h-full">
                <div className="md:hidden flex items-center p-2 border-b bg-white">
                    <button
                        className="p-2 mr-2"
                        onClick={() => setShowSidebar(true)}
                    >
                        <svg width="28" height="28" fill="none" stroke="currentColor"><path d="M4 6h20M4 12h20M4 18h20" /></svg>
                    </button>
                    <span className="font-semibold text-lg">Admin Chat</span>
                </div>
                {selectedAdmin ? (
                    <Chat
                        userId={id}
                        role="admin"
                        chatWithId={selectedAdmin._id}
                        chatWithRole="admin"
                        chatWithName={selectedAdmin.name}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select an admin to start chatting
                    </div>
                )}
            </main>
        </div>
    );
}