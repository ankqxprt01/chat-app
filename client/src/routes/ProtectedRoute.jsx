import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const reduxToken = useSelector(
    (state) => state.auth.token
  );

  const token =
    reduxToken ||
    localStorage.getItem("token");

  return token ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}

export default ProtectedRoute;