import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PERMISSION_ROUTE_MAP = {
    "dashboard": "/",
    "admin-list": "/admin-list",
    "admin-chat": "/admin-chat",
    "service-requests": "/service-requests",
    "services": "/services",
    "users": "/users",
    "technicians": "/technicians",
    "address": "/road",
    "points": "/points",
    "inventory": "/inventory",
    "Settings": "/splash-screen",
    "user-logs": "/user-logs"
};

export default function PublicRoute({ children }) {
    const { token, permissions } = useAuth();

    if (token) {
        let redirectPath = "/";
        for (const perm of permissions) {
            if (PERMISSION_ROUTE_MAP[perm]) {
                redirectPath = PERMISSION_ROUTE_MAP[perm];
                break;
            }
        }
        return <Navigate to={redirectPath} replace />;
    }

    return children;
}