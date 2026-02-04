import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

function Chat({ userId, role, chatWithId, chatWithRole, chatWithName }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        socket.emit("join", { userId, role });

        fetch(
            `${import.meta.env.VITE_API_URL}/api/chat/history?user1=${userId}&user2=${chatWithId}`
        )
            .then(res => res.json())
            .then(setMessages);

        socket.on("receive_message", (msg) => {
            if (
                (msg.from === userId && msg.to === chatWithId) ||
                (msg.from === chatWithId && msg.to === userId)
            ) {
                setMessages(prev => [...prev, msg]);
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

    return (
        <div className="flex flex-col h-full bg-white">

            <div className="flex items-center gap-3 px-6 py-4 border-b">
                <div className="h-10 w-10 rounded-full bg-bgGreen/20 flex items-center justify-center font-semibold text-bgGreen">
                    {chatWithName?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="font-medium text-gray-800">
                        {chatWithName}
                    </div>
                    {/* <div className="text-xs text-gray-400">
                        {chatWithRole}
                    </div> */}
                </div>
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
                            key={idx}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow
                                    ${isMe
                                        ? "bg-bgGreen text-white rounded-br-md"
                                        : "bg-white text-gray-800 border rounded-bl-md"
                                    }
                                `}
                            >
                                {msg.message}
                                <div className="text-[10px] opacity-50 text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </div>
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