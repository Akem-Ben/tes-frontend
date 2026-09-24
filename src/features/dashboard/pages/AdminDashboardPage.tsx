import { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Card, Badge } from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import { StatCard } from "../components/StatCard";
import { FacilitatorPerformanceChart } from "../components/FacilitatorPerformanceChart";
import { PaymentStatusChart } from "../components/PaymentStatusChart";
import { useDb, currentWeekKey } from "@/shared/lib";
import { useAuth } from "@/features/auth";
import {
  facilitatorPerformance,
  groupAverages,
  orgSummaries,
} from "@/features/analytics";
import {
  ensureCurrentPeriodPayments,
  paymentSummary,
} from "@/features/payments";
import { media } from "@/theme";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ChartsGrid = styled.div`
  margin-top: 1.25rem;
  display: grid;
  gap: 1rem;

  ${media.lg} {
    grid-template-columns: 2fr 1fr;
  }
`;

const GoToGrid = styled.div`
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const GoToLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.textBody};

  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
    color: ${({ theme }) => theme.color.brand};
  }
`;

const GoToIcon = styled.span`
  font-size: 1.25rem;
`;

const links = [
  { to: "/facilitators", label: "Facilitators", icon: "🧑‍🏫" },
  { to: "/payments", label: "Payments", icon: "💳" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/reports", label: "Reports", icon: "📤" },
];

export function AdminDashboardPage() {
  const db = useDb();
  const { user } = useAuth();
  const performance = facilitatorPerformance("monthly");
  const orgAverages = groupAverages(orgSummaries("monthly"));
  const activeStudents = db.students.filter((s) => s.isActive);

  useEffect(() => {
    ensureCurrentPeriodPayments();
  }, []);

  const payments = db.payments.filter((p) => p.period === currentWeekKey());
  const summary = paymentSummary(payments);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "Admin"}`}
        subtitle="System-wide operations dashboard"
      />

      <StatsGrid>
        <StatCard
          label="Facilitators"
          value={db.facilitators.length}
          icon="🧑‍🏫"
        />
        <StatCard
          label="Active students"
          value={activeStudents.length}
          icon="🎓"
          hint={`${db.students.length} total`}
        />
        <StatCard
          label="Avg. attendance"
          value={`${orgAverages.attendance}%`}
          icon="📊"
        />
        <StatCard
          label="Payments this period"
          value={`₦${summary.totalCollected.toLocaleString()}`}
          icon="💳"
          hint={`of ₦${summary.totalDue.toLocaleString()} due`}
        />
      </StatsGrid>

      <ChartsGrid>
        <Card
          title="Facilitator performance"
          subtitle="Attendance and assignment submissions, last 30 days"
        >
          <FacilitatorPerformanceChart rows={performance} />
        </Card>
        <Card
          title="Payment status"
          subtitle={`This period: ${currentWeekKey()}`}
        >
          <PaymentStatusChart summary={summary} />
          <Badge tone={summary.unpaid > 0 ? "red" : "green"}>
            {summary.unpaid} unpaid
          </Badge>
        </Card>
      </ChartsGrid>

      <GoToGrid>
        {links.map((l) => (
          <GoToLink key={l.to} to={l.to}>
            <GoToIcon aria-hidden>{l.icon}</GoToIcon>
            {l.label}
          </GoToLink>
        ))}
      </GoToGrid>
    </>
  );
}
