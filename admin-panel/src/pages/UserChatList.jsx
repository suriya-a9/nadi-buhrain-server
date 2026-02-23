import { useEffect, useState } from "react";
import api from "../services/api";
import { StreamChat } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import "stream-chat-react/css/v2/index.css";
import { useAuth } from "../context/AuthContext";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function UserChatList() {
    const { id } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatClient, setChatClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!id) return;
        api.get("/account-verify/all-user-list", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }).then(res => {
            setUsers(res.data.data.filter(u => u._id !== id));
        });
    }, [id]);

    useEffect(() => {
        if (!id) return;
        async function initStream() {
            const currentUser = users.find(u => u._id === id) || {};
            const res = await api.post("/stream-chat/token", {
                userId: id,
                name: currentUser.basicInfo?.fullName,
                email: currentUser.basicInfo?.email
            });
            const { token } = res.data;
            const client = StreamChat.getInstance(STREAM_API_KEY);
            await client.connectUser({ id }, token);
            setChatClient(client);
        }
        initStream();
        return () => chatClient && chatClient.disconnectUser();
    }, [id, users]);

    useEffect(() => {
        if (!chatClient || !selectedUser) return;
        async function setupChannel() {
            await api.post("/stream-chat/token", {
                userId: selectedUser._id,
                name: selectedUser.basicInfo?.fullName,
                email: selectedUser.basicInfo?.email
            });
            const channel = chatClient.channel("messaging", {
                members: [id, selectedUser._id]
            });
            await channel.watch();
            setChannel(channel);
        }
        setupChannel();
    }, [chatClient, selectedUser, id]);

    if (!id) return null;

    return (
        <div className="h-screen bg-gray-50 flex flex-col md:flex-row">
            <div
                className={`
                    fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden
                    ${showSidebar ? "block" : "hidden"}
                `}
                onClick={() => setShowSidebar(false)}
            />
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
                <div className="px-4 py-2 border-b">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-bgGreen text-sm"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
                    {users
                        .filter(user =>
                            user.basicInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                            user.basicInfo?.email?.toLowerCase().includes(search.toLowerCase())
                        )
                        .map(user => {
                            const isActive = selectedUser?._id === user._id;
                            return (
                                <button
                                    key={user._id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setShowSidebar(false);
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
                {channel ? (
                    <div className="flex flex-col h-full bg-white shadow-md min-h-0">
                        <div className="border-b px-6 py-4 flex items-center gap-3 bg-bgGreen/10">
                            <div className="h-10 w-10 rounded-full bg-bgGreen/20 flex items-center justify-center font-bold text-bgGreen text-lg">
                                {selectedUser?.basicInfo?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-gray-800">{selectedUser?.basicInfo?.fullName}</div>
                                <div className="text-xs text-gray-500">{selectedUser?.basicInfo?.email}</div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col min-h-0 hide-scrollbar">
                            <Chat client={chatClient} theme="messaging light">
                                <Channel channel={channel}>
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar min-h-0">
                                            <MessageList />
                                        </div>
                                        <div className="border-t px-6 py-4 bg-gray-50">
                                            <MessageInput />
                                        </div>
                                    </div>
                                </Channel>
                            </Chat>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-lg font-medium">
                        Select a user to start chatting
                    </div>
                )}
            </main>
        </div>
    );
}