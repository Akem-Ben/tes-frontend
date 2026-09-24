import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { AppShell, PageLoader } from "@/shared/components";
import type { Role } from "@/shared/lib/mockStore";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Restrict to specific roles; omit to allow any signed-in role. */
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { ready, role } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader fullScreen title="Loading your account…" />;
  if (!role)
    return (
      <Navigate to="/login/facilitator" state={{ from: location }} replace />
    );
  if (roles && role !== "superadmin" && !roles.includes(role))
    return <Navigate to="/dashboard" replace />;

  return <AppShell>{children}</AppShell>;
}
