import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // logged in but not an admin → redirect or show error
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
