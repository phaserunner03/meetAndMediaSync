import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

interface PrivateRouteProps {
  Component: React.ComponentType<any>;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ Component, ...rest }) => {
  const { userLoggedIn, currentUser } = useAuth();
  
  if (currentUser && currentUser?.role.name ==='NAU') {
    return <Navigate to="/unauthorized" replace />;
  }
  if (!userLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <Component {...rest} />;
};

export default PrivateRoute;
