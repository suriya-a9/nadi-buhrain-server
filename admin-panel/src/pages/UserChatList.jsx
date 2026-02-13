import { useEffect, useState } from "react";
import api from "../services/api";
import Chat from "./Chat";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_URL);

export default function UserChatList() {
    const { id } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unreadMap, setUnreadMap] = useState({});
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get("/account-verify/all-user-list", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }).then(res => {
            setUsers(res.data.data.filter(u => u._id !== id));
        });
    }, [id]);

    useEffect(() => {
        socket.on("receive_message", (msg) => {
            if (msg.to !== id) return;
            if (selectedUser?._id !== msg.from) {
                setUnreadMap(prev => ({
                    ...prev,
                    [msg.from]: true
                }));
            }
        });
        return () => {
            socket.off("receive_message");
        };
    }, [id, selectedUser]);

    useEffect(() => {
        if (!id) return;
        api.get(`/chat/unread?userId=${id}`).then(res => {
            const unread = {};
            res.data.forEach(msg => {
                unread[msg.from] = true;
            });
            setUnreadMap(unread);
        });
    }, [id]);

    if (!id) return null;

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
                            User Chat
                        </h2>
                        <p className="text-xs text-gray-400">
                            Chat with users
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
                    {users.map(user => {
                        const isActive = selectedUser?._id === user._id;
                        return (
                            <button
                                key={user._id}
                                onClick={async () => {
                                    setSelectedUser(user);
                                    setShowSidebar(false);
                                    setUnreadMap(prev => ({
                                        ...prev,
                                        [user._id]: false
                                    }));
                                    await api.post("/chat/mark-read", {
                                        from: user._id,
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
                                        {user.basicInfo?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    {unreadMap[user._id] && (
                                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bgGreen ring-2 ring-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate">
                                        {user.basicInfo?.fullName}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {user.basicInfo?.email}
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
                    <span className="font-semibold text-lg">User Chat</span>
                </div>
                {selectedUser ? (
                    <Chat
                        userId={id}
                        role="admin"
                        chatWithId={selectedUser._id}
                        chatWithRole="user"
                        chatWithName={selectedUser.basicInfo?.fullName}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a user to start chatting
                    </div>
                )}
            </main>
        </div>
    );
}