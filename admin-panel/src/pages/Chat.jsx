import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { FaTrash } from "react-icons/fa";

const socket = io(import.meta.env.VITE_API_URL);

function Chat({ userId, role, chatWithId, chatWithRole, chatWithName }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        socket.emit("join", { userId, role });

        api.post("/chat/history", {
            user1: userId,
            user2: chatWithId
        }).then(res => setMessages(res.data));

        socket.on("receive_message", (msg) => {
            if (
                (msg.from === userId && msg.to === chatWithId) ||
                (msg.from === chatWithId && msg.to === userId)
            ) {
                setMessages(prev => [...prev, msg]);
                console.log("receive")
            }
        });

        socket.on("message_sent", (msg) => {
            setMessages(prev => [...prev, msg]);
            setSending(false);
        });

        return () => {
            socket.off("receive_message");
            socket.off("message_sent");
        };
    }, [userId, role, chatWithId, chatWithRole]);

    const sendMessage = () => {
        if (!input.trim()) return;
        setSending(true);
        socket.emit("send_message", {
            from: userId,
            to: chatWithId,
            fromRole: role,
            toRole: chatWithRole,
            message: input
        });
        setInput("");
    };

    const handleDeleteMessage = async (messageId) => {
        await api.post(`/chat/delete-one?messageId=${messageId}`);
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleDeleteAll = async () => {
        setDeleting(true);
        await api.post("/chat/delete-all", { from: userId, to: chatWithId });
        setMessages([]);
        setDeleting(false);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center gap-3 px-6 py-4 border-b justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-bgGreen/20 flex items-center justify-center font-semibold text-bgGreen">
                        {chatWithName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">
                            {chatWithName}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleDeleteAll}
                    className="text-red-500 flex items-center gap-1 text-xs border px-2 py-1 rounded hover:bg-red-50"
                    disabled={deleting}
                    title="Delete entire chat history"
                >
                    <FaTrash /> Clear Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 hide-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20 text-sm">
                        👋 Say hello
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.from === userId;
                    return (
                        <div
                            key={msg._id || idx}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`relative max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow
                                    ${isMe
                                        ? "bg-bgGreen text-white rounded-br-md"
                                        : "bg-white text-gray-800 border rounded-bl-md"
                                    }
                                `}
                            >
                                {msg.message}
                                <div className="text-[10px] opacity-50 text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleDateString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "2-digit"
                                    })}{" "}
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </div>
                                {isMe && (
                                    <button
                                        className="absolute top-1 right-1 text-red-400 hover:text-red-600"
                                        title="Delete message"
                                        onClick={() => handleDeleteMessage(msg._id)}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t px-4 py-3 bg-white">
                <div className="flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message…"
                        rows={1}
                        className="flex-1 resize-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bgGreen/40"
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={sending || !input.trim()}
                        className="bg-bgGreen text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 disabled:opacity-40"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;