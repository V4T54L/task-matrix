import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authProvider";

type ProtectedRouteProps = {
    children: ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user } = useAuth();

    return user ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
