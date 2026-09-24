import { Link } from "react-router-dom";
import styled from "styled-components";
import { Card, Button, Badge } from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { StatCard } from "../components/StatCard";
import { TodayPanel } from "@/features/signinout";
import { useDb } from "@/shared/lib";
import { useActiveGroup } from "@/features/groups";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { todayISO, formatDate, formatDateTime } from "@/shared/lib";
import { media } from "@/theme";

const quickLinks = (groupId: string) => [
  { to: "/cohorts", label: "Cohorts", icon: "📅" },
  { to: "/groups", label: "Groups", icon: "👥" },
  { to: `/groups/${groupId}/students`, label: "Students", icon: "🎓" },
  { to: `/groups/${groupId}/signinout`, label: "Sign In/Out", icon: "⏰" },
  { to: `/groups/${groupId}/attendance`, label: "Attendance", icon: "✅" },
  { to: `/groups/${groupId}/assignments`, label: "Assignments", icon: "📝" },
  { to: `/groups/${groupId}/retreats`, label: "Retreats", icon: "⛺" },
  { to: `/groups/${groupId}/analytics`, label: "Analytics", icon: "📊" },
];

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const TwoColGrid = styled.div`
  margin-top: 1.25rem;
  display: grid;
  gap: 1rem;

  ${media.lg} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ActivityList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const ActivityRow = styled.li`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ActivityTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const ActivityMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const EmptyRow = styled.li`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const GoToCard = styled(Card)`
  margin-top: 1.25rem;
`;

const GoToGrid = styled.div`
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
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
    color: ${({ theme }) => theme.color.brand};
  }
`;

const GoToIcon = styled.span`
  font-size: 1.25rem;
`;

export function FacilitatorDashboardPage() {
  const db = useDb();
  const { user } = useAuth();
  const facilitatorId = useFacilitatorId();
  const { group, cohort } = useActiveGroup();

  const cohorts = db.cohorts.filter((s) => s.facilitatorId === facilitatorId);
  const students = group
    ? db.students.filter((s) => s.groupIds.includes(group.id))
    : [];
  const today = todayISO();
  const todayRecords = db.signInOuts.filter((r) => r.date === today);
  const events = group
    ? db.attendanceEvents.filter((e) => e.groupId === group.id)
    : [];
  const assignments = group
    ? db.assignments.filter((a) => a.groupId === group.id)
    : [];

  const pending = students.filter((s) => {
    if (
      !s.isActive ||
      !s.hourOfPriesthood ||
      s.hourOfPriesthood > new Date().toTimeString().slice(0, 5)
    )
      return false;
    const r = todayRecords.find((x) => x.studentId === s.id);
    return !r || !r.signedIn || !r.signedOut;
  }).length;

  if (!group) {
    return (
      <>
        <PageHeader title={`Welcome, ${user?.name ?? "Facilitator"}`} />
        <EmptyState
          icon="🚀"
          title="Let's get you set up"
          message="Create your first cohort, then create a group inside it and add your students."
          action={
            <Link to="/cohorts">
              <Button>Create a cohort</Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "Facilitator"}`}
        subtitle={cohort ? `${cohort.name} · ${group.name}` : group.name}
      />

      <StatsGrid>
        <StatCard label="Cohorts" value={cohorts.length} icon="📅" />
        <StatCard
          label="Active group"
          value={group.name}
          icon="👥"
          hint={cohort?.status}
        />
        <StatCard
          label="Students"
          value={students.length}
          icon="🎓"
          hint={`${students.filter((s) => s.isActive).length} active`}
        />
        <StatCard
          label="Pending today"
          value={pending}
          icon="⏰"
          hint="sign in / out"
        />
      </StatsGrid>

      <TwoColGrid>
        <Card title="Today" subtitle="Priesthood hours due to be marked">
          <TodayPanel
            students={students}
            records={todayRecords}
            groupId={group.id}
          />
        </Card>

        <Card title="Recent activity">
          <ActivityList>
            {events.slice(0, 3).map((e) => (
              <ActivityRow key={e.id}>
                <div>
                  <ActivityTitle>{e.name}</ActivityTitle>
                  <ActivityMeta>{formatDateTime(e.date)}</ActivityMeta>
                </div>
                <Badge tone="brand">{e.type}</Badge>
              </ActivityRow>
            ))}
            {assignments.slice(0, 3).map((a) => (
              <ActivityRow key={a.id}>
                <div>
                  <ActivityTitle>{a.title}</ActivityTitle>
                  <ActivityMeta>Due {formatDate(a.dueDate)}</ActivityMeta>
                </div>
                <Badge tone="slate">{a.type}</Badge>
              </ActivityRow>
            ))}
            {events.length === 0 && assignments.length === 0 && (
              <EmptyRow>Nothing recorded yet.</EmptyRow>
            )}
          </ActivityList>
        </Card>
      </TwoColGrid>

      <GoToCard title="Go to">
        <GoToGrid>
          {quickLinks(group.id).map((q) => (
            <GoToLink key={q.to} to={q.to}>
              <GoToIcon aria-hidden>{q.icon}</GoToIcon>
              {q.label}
            </GoToLink>
          ))}
        </GoToGrid>
      </GoToCard>
    </>
  );
}
