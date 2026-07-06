import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PublicRoute({ children }) {
  const token =
    useSelector((state) => state.auth.token) ||
    localStorage.getItem("token");

  return token ? (
    <Navigate to="/chat" replace />
  ) : (
    children
  );
}

export default PublicRoute;