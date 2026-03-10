import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const StreamContext = createContext();

function playNotificationSound() {
    const audio = new Audio("/assets/notification.mp3");
    audio.play();
}

export function StreamProvider({ children }) {
    const { id } = useAuth();
    const [chatClient, setChatClient] = useState(null);

    useEffect(() => {
        if (!id) return;

        async function init() {
            const res = await api.post("/stream-chat/token", { userId: id });
            const { token } = res.data;

            const client = StreamChat.getInstance(STREAM_API_KEY);

            await client.connectUser({ id }, token);

            client.on("message.new", event => {
                if (event.message.user.id !== id) {
                    playNotificationSound();
                }
            });

            setChatClient(client);
        }

        init();

        return () => {
            chatClient?.disconnectUser();
        };
    }, [id]);

    return (
        <StreamContext.Provider value={{ chatClient }}>
            {children}
        </StreamContext.Provider>
    );
}

export const useStream = () => useContext(StreamContext);