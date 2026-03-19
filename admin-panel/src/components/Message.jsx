import { MessageSimple } from "stream-chat-react";

function formatIndianDateTime(date) {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function CustomMessage(props) {
    const { message } = props;

    return (
        <div>
            <MessageSimple {...props} />

            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                {formatIndianDateTime(message?.created_at)}
            </div>
        </div>
    );
}