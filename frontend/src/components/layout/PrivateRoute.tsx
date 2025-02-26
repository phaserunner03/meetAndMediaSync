import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

interface PrivateRouteProps {
  Component: React.ComponentType<any>;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ Component, ...rest }) => {
  const { userLoggedIn } = useAuth();
  
  return userLoggedIn ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/" replace />
  );
};

export default PrivateRoute;