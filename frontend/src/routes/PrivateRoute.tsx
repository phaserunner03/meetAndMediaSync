import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ROUTES } from "../constants";

interface PrivateRouteProps {
  Component: React.ComponentType;
}

const PrivateRoute = ({ Component }: PrivateRouteProps) => {
  const { userLoggedIn, currentUser } = useAuth();

  if (!userLoggedIn) return <Navigate to={ROUTES.HOME} replace />;
  if (currentUser?.role?.name === "NAU") return <Navigate to={ROUTES.UNAUTHORIZED} replace />;

  return <Component />;
};

export default PrivateRoute;
