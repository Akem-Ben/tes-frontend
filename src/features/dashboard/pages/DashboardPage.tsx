import { useAuth } from "@/features/auth";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { PresidentDashboardPage } from "./PresidentDashboardPage";
import { FacilitatorDashboardPage } from "./FacilitatorDashboardPage";

export function DashboardPage() {
  const { role } = useAuth();
  if (role === "admin") return <AdminDashboardPage />;
  if (role === "president") return <PresidentDashboardPage />;
  return <FacilitatorDashboardPage />;
}
