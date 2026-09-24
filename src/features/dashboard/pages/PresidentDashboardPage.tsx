import { Link } from "react-router-dom";
import styled from "styled-components";
import { Card, Badge } from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import { StatCard } from "../components/StatCard";
import { FacilitatorPerformanceChart } from "../components/FacilitatorPerformanceChart";
import { useDb } from "@/shared/lib";
import { useAuth } from "@/features/auth";
import {
  facilitatorPerformance,
  groupAverages,
  orgSummaries,
} from "@/features/analytics";
import { media } from "@/theme";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ChartCard = styled(Card)`
  margin-top: 1.25rem;
`;

const GoToGrid = styled.div`
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

const links = [
  { to: "/facilitators", label: "Facilitators", icon: "🧑‍🏫" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/reports", label: "Reports", icon: "📤" },
];

export function PresidentDashboardPage() {
  const db = useDb();
  const { user } = useAuth();
  const performance = facilitatorPerformance("monthly");
  const orgAverages = groupAverages(orgSummaries("monthly"));
  const activeStudents = db.students.filter((s) => s.isActive);
  const needFollowUp = orgSummaries("monthly").filter(
    (s) => s.attendanceRate < 60 || s.submissionRate < 60,
  );

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "President"}`}
        subtitle="Every facilitator, every group, one view"
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
      </StatsGrid>

      <ChartCard
        title="Facilitator performance"
        subtitle="Attendance and assignment submissions, last 30 days"
      >
        <FacilitatorPerformanceChart rows={performance} />
      </ChartCard>

      <ChartCard
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
      </ChartCard>

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
