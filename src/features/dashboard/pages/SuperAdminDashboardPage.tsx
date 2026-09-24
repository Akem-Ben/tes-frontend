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
    grid-template-columns: repeat(5, minmax(0, 1fr));
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

const FollowUpList = styled.ul`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const FollowUpRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const FollowUpCard = styled(Card)`
  margin-top: 1.25rem;
`;

const FacilitatorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`;

const Td = styled.td`
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.textBody};
`;

const FacilitatorLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const GoToGrid = styled.div`
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  ${media.lg} {
    grid-template-columns: repeat(5, minmax(0, 1fr));
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
  { to: "/cohorts", label: "Cohorts", icon: "📅" },
  { to: "/groups", label: "Groups", icon: "👥" },
  { to: "/payments", label: "Payments", icon: "💳" },
  { to: "/feedback", label: "Feedback", icon: "💬" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/reports", label: "Reports", icon: "📤" },
  { to: "/waiting-list", label: "Waiting List", icon: "🕒" },
  { to: "/chat", label: "Chat", icon: "💭" },
];

/**
 * Combines what a president sees (org-wide performance, students needing follow-up), what an admin
 * sees (payments) and a way into what each individual facilitator sees (the Facilitators table below,
 * plus every Go-to link) - one dashboard instead of three.
 */
export function SuperAdminDashboardPage() {
  const db = useDb();
  const { user } = useAuth();
  const performance = facilitatorPerformance("monthly");
  const orgAverages = groupAverages(orgSummaries("monthly"));
  const activeStudents = db.students.filter((s) => s.isActive);
  const needFollowUp = orgSummaries("monthly").filter(
    (s) => s.attendanceRate < 60 || s.submissionRate < 60,
  );

  useEffect(() => {
    ensureCurrentPeriodPayments();
  }, []);

  const payments = db.payments.filter((p) => p.period === currentWeekKey());
  const summary = paymentSummary(payments);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "Super Admin"}`}
        subtitle="Everything a president, an admin and every facilitator sees - in one place"
      />

      <StatsGrid>
        <StatCard
          label="Facilitators"
          value={db.facilitators.length}
          icon="🧑‍🏫"
        />
        <StatCard label="Groups" value={db.groups.length} icon="👥" />
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
          hint={`${orgAverages.submissions}% submissions`}
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

      <FollowUpCard
        title="Students needing follow-up"
        subtitle={`${needFollowUp.length} below 60% attendance or submissions`}
      >
        <FollowUpList>
          {needFollowUp.slice(0, 8).map((s) => (
            <FollowUpRow key={s.student.id}>
              <Link to={`/students/${s.student.id}`}>{s.student.name}</Link>
              <Badge tone="red">
                {s.attendanceRate}% attendance · {s.submissionRate}% submissions
              </Badge>
            </FollowUpRow>
          ))}
          {needFollowUp.length === 0 && (
            <FollowUpRow>Everyone is on track this month.</FollowUpRow>
          )}
        </FollowUpList>
      </FollowUpCard>

      <FollowUpCard
        title="Every facilitator"
        subtitle="Open Groups or Cohorts to see exactly what any one of them sees"
      >
        <FacilitatorTable>
          <thead>
            <tr>
              <Th>Facilitator</Th>
              <Th>Cohorts</Th>
              <Th>Groups</Th>
              <Th>Students</Th>
            </tr>
          </thead>
          <tbody>
            {db.facilitators.map((f) => {
              const cohortCount = db.cohorts.filter(
                (c) => c.facilitatorId === f.id,
              ).length;
              const facGroups = db.groups.filter((g) =>
                g.facilitatorIds.includes(f.id),
              );
              const studentCount = db.students.filter((s) =>
                s.groupIds.some((gid) => facGroups.some((g) => g.id === gid)),
              ).length;
              return (
                <tr key={f.id}>
                  <Td>
                    <FacilitatorLink to="/facilitators">
                      {f.name}
                    </FacilitatorLink>
                  </Td>
                  <Td>{cohortCount}</Td>
                  <Td>{facGroups.length}</Td>
                  <Td>{studentCount}</Td>
                </tr>
              );
            })}
          </tbody>
        </FacilitatorTable>
      </FollowUpCard>

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
