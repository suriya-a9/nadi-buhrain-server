import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PermissionRoute({ permission, children }) {
    const { permissions } = useAuth();
    if (!permissions.includes(permission)) {
        return <Navigate to="/" replace />;
    }
    return children;
}