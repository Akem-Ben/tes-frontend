import { useAuth } from "@/features/auth";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { PresidentDashboardPage } from "./PresidentDashboardPage";
import { FacilitatorDashboardPage } from "./FacilitatorDashboardPage";
import { SuperAdminDashboardPage } from "./SuperAdminDashboardPage";

export function DashboardPage() {
  const { role } = useAuth();
  if (role === "superadmin") return <SuperAdminDashboardPage />;
  if (role === "admin") return <AdminDashboardPage />;
  if (role === "president") return <PresidentDashboardPage />;
  return <FacilitatorDashboardPage />;
}
