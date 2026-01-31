import { Navigate } from "react-router-dom";
import { decryptLocalStorage } from "../utils/DparcelHelper";

const RoleRedirect = () => {
  const user = decryptLocalStorage("user");

  if (!user || !user.roles) {
    return <Navigate to="/signin" replace />;
  }

  if (user.roles.includes("admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.roles.includes("shipper")) {
    return <Navigate to="/shipper/dashboard" replace />;
  }

  if (user.roles.includes("shopper")) {
    return <Navigate to="/shopper/request" replace />;
  }

  return <Navigate to="/signin" replace />;
};

export default RoleRedirect;
