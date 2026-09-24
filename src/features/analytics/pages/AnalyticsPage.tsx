import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Tabs,
  Table,
  type Column,
  ProgressBar,
  Badge,
  Select,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { groupAverages, groupSummaries, orgSummaries } from "../api";
import type { StudentSummary } from "../api/types";
import { useActiveGroup, useGroupParam } from "@/features/groups";
import { useAuth } from "@/features/auth";
import type { TimeFilter } from "@/shared/lib";

const filters = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "session", label: "Per session" },
];

type SortKey = "name" | "attendance" | "submissions" | "signIn";

const StudentLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const Toolbar = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

const SelectWrap = styled.div`
  width: 12rem;
`;

const AveragesGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ChartCard = styled(Card)`
  margin-top: 1rem;
`;

const Chart = styled.div`
  display: flex;
  height: 12rem;
  align-items: flex-end;
  gap: 0.5rem;
  overflow-x: auto;
`;

const Bar = styled.div`
  display: flex;
  min-width: 3rem;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
`;

const BarPercent = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.color.textMuted};
`;

const BarFill = styled.div<{ $height: number }>`
  width: 100%;
  border-top-left-radius: ${({ theme }) => theme.radius.md};
  border-top-right-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.color.brand};
  height: ${({ $height }) => Math.max($height, 3)}%;
`;

const BarLabel = styled.span`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 10px;
  color: ${({ theme }) => theme.color.textMuted};
`;

const TableCard = styled(Card)`
  margin-top: 1rem;
`;

const EmptyText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function AnalyticsPage() {
  const db = useDb();
  const { role } = useAuth();
  const { group: ownGroup } = useActiveGroup();
  const { group: paramGroup } = useGroupParam();
  const [filter, setFilter] = useState<TimeFilter>("monthly");
  const [sort, setSort] = useState<SortKey>("attendance");
  const [facilitatorId, setFacilitatorId] = useState("all");
  const isGroupScoped = Boolean(paramGroup);
  const isOrgWide =
    !isGroupScoped &&
    (role === "president" || role === "admin" || role === "superadmin");
  const group = paramGroup ?? ownGroup;

  if (!isOrgWide && !group) {
    return (
      <EmptyState
        icon="📊"
        title="No group yet"
        message="Create a group and add students first."
      />
    );
  }

  // useDb() keeps this component re-rendering when records change.
  void db;
  const summaries = (
    isOrgWide
      ? orgSummaries(
          filter,
          facilitatorId === "all" ? undefined : facilitatorId,
        )
      : groupSummaries(group!.id, filter)
  ).sort((a, b) => {
    if (sort === "name") return a.student.name.localeCompare(b.student.name);
    if (sort === "submissions") return a.submissionRate - b.submissionRate;
    if (sort === "signIn") return a.signInRate - b.signInRate;
    return a.attendanceRate - b.attendanceRate;
  });
  const averages = groupAverages(summaries);
  const needFollowUp = summaries.filter(
    (s) => s.attendanceRate < 60 || s.submissionRate < 60,
  );

  const columns: Array<Column<StudentSummary>> = [
    {
      header: "Student",
      cell: (s) => (
        <StudentLink to={`/students/${s.student.id}`}>
          {s.student.name}
        </StudentLink>
      ),
    },
    { header: "Attendance", cell: (s) => `${s.attendanceRate}%` },
    { header: "Submissions", cell: (s) => `${s.submissionRate}%` },
    { header: "Sign in", cell: (s) => `${s.signInRate}%` },
    { header: "Sign out", cell: (s) => `${s.signOutRate}%` },
    {
      header: "Flag",
      cell: (s) =>
        s.attendanceRate < 60 || s.submissionRate < 60 ? (
          <Badge tone="red">Follow up</Badge>
        ) : (
          <Badge tone="green">On track</Badge>
        ),
    },
  ];

  return (
    <>
      {isGroupScoped && (
        <BackLink
          to={`/groups/${group!.id}`}
          label={`Back to ${group!.name}`}
        />
      )}
      <PageHeader
        title="Analytics"
        subtitle={isOrgWide ? "Every facilitator" : group!.name}
      />

      <Toolbar>
        <Tabs
          tabs={filters}
          active={filter}
          onChange={(id) => setFilter(id as TimeFilter)}
        />
        {isOrgWide && (
          <SelectWrap>
            <Select
              value={facilitatorId}
              onChange={(e) => setFacilitatorId(e.target.value)}
              options={[
                { value: "all", label: "All facilitators" },
                ...db.facilitators.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          </SelectWrap>
        )}
        <SelectWrap>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            options={[
              { value: "attendance", label: "Sort: attendance" },
              { value: "submissions", label: "Sort: submissions" },
              { value: "signIn", label: "Sort: sign-in" },
              { value: "name", label: "Sort: name" },
            ]}
          />
        </SelectWrap>
      </Toolbar>

      <Card title={isOrgWide ? "Org-wide averages" : "Group averages"}>
        <AveragesGrid>
          <ProgressBar label="Attendance" value={averages.attendance} />
          <ProgressBar
            label="Assignment submissions"
            value={averages.submissions}
          />
          <ProgressBar label="Sign-in consistency" value={averages.signIn} />
          <ProgressBar label="Sign-out consistency" value={averages.signOut} />
        </AveragesGrid>
      </Card>

      <ChartCard title="Attendance by student">
        <Chart>
          {summaries.map((s) => (
            <Bar key={s.student.id}>
              <BarPercent>{s.attendanceRate}%</BarPercent>
              <BarFill $height={s.attendanceRate} />
              <BarLabel>{s.student.name.split(" ")[0]}</BarLabel>
            </Bar>
          ))}
        </Chart>
      </ChartCard>

      <TableCard
        title="All students"
        subtitle={`${needFollowUp.length} need follow-up`}
      >
        <Table
          columns={columns}
          rows={summaries}
          rowKey={(s) => s.student.id}
          empty={<EmptyText>No students yet.</EmptyText>}
        />
      </TableCard>
    </>
  );
}
