import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface PrivateRouteProps {
  Component: React.ComponentType;
}

const PrivateRoute = ({ Component }: PrivateRouteProps) => {
  const { userLoggedIn, currentUser } = useAuth();

  if (!userLoggedIn) return <Navigate to="/" replace />;
  if (currentUser?.role?.name === "NAU") return <Navigate to="/unauthorized" replace />;

  return <Component />;
};

export default PrivateRoute;
