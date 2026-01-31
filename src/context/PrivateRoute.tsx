import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { decryptLocalStorage } from "../utils/DparcelHelper";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const accessToken = decryptLocalStorage("access_token");

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
