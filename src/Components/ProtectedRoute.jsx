import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    // not logged in (or a stale session with no valid user)
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
