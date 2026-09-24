import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Badge,
  Tabs,
  Table,
  Select,
  Button,
  ConfirmModal,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { StudentSummaryCard, studentSummary } from "@/features/analytics";
import { FeedbackList } from "@/features/feedback";
import { useDb } from "@/shared/lib";
import {
  addStudentToGroup,
  deleteStudent,
  removeStudentFromGroup,
  toggleActive,
} from "../api";
import { useActiveGroup } from "@/features/groups";
import { useAuth } from "@/features/auth";
import { useConfirm } from "@/shared/hooks";
import { formatDate, type TimeFilter } from "@/shared/lib";
import { media } from "@/theme";

const filters = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "session", label: "Per session" },
];

const TabsRow = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

const MetaText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Grid = styled.div`
  display: grid;
  gap: 1rem;

  ${media.lg} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const EmptyText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const GroupsCard = styled(Card)`
  margin-bottom: 1rem;
`;

const GroupList = styled.ul`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const GroupRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.5rem 0.75rem;
`;

const GroupName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const CohortLabel = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const AddGroupRow = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const AddGroupSelectWrap = styled.div`
  min-width: 12rem;
  flex: 1;
`;

const ErrorText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.danger};
`;

const DangerCard = styled(Card)`
  margin-top: 1rem;
`;

const DangerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export function StudentProfilePage() {
  const { studentId = "" } = useParams<{ studentId: string }>();
  const db = useDb();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { groups } = useActiveGroup();
  const [filter, setFilter] = useState<TimeFilter>("monthly");
  const [addGroupId, setAddGroupId] = useState("");
  const [groupError, setGroupError] = useState("");
  const confirm = useConfirm();
  const student = db.students.find((s) => s.id === studentId);
  const summary = studentSummary(studentId, filter);

  if (!student || !summary) {
    return (
      <EmptyState
        icon="🔍"
        title="Student not found"
        message="This student no longer exists."
      />
    );
  }

  const signIns = db.signInOuts
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const records = [
    ...db.attendanceRecords
      .filter((r) => r.studentId === student.id)
      .map((r) => {
        const event = db.attendanceEvents.find(
          (e) => e.id === r.attendanceEventId,
        );
        return {
          id: r.id,
          name: event?.name ?? "—",
          type: event?.type ?? "—",
          date: r.date,
          attended: r.attended,
        };
      }),
    ...db.weeklyClassAttendance
      .filter((r) => r.studentId === student.id)
      .map((r) => {
        const weeklyClass = db.weeklyClasses.find(
          (c) => c.id === r.weeklyClassId,
        );
        return {
          id: r.id,
          name: weeklyClass?.name ?? "—",
          type: "Weekly Class",
          date: r.date,
          attended: r.attended,
        };
      }),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const submissions = db.submissions.filter((s) => s.studentId === student.id);
  const isFacilitator = role === "facilitator";

  const currentGroups = student.groupIds
    .map((gid) => db.groups.find((g) => g.id === gid))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);
  const currentCohortIds = new Set(currentGroups.map((g) => g.cohortId));
  const addableGroups = groups.filter((g) => !student.groupIds.includes(g.id));

  const handleAddToGroup = () => {
    if (!addGroupId) return;
    try {
      addStudentToGroup(student.id, addGroupId);
      setAddGroupId("");
      setGroupError("");
    } catch (err) {
      setGroupError(
        err instanceof Error ? err.message : "Could not add to group.",
      );
    }
  };

  return (
    <>
      <BackLink label="Back" />
      <PageHeader
        title={student.name}
        subtitle={`${student.registrationNumber} · joined ${formatDate(student.dateJoined)}`}
        action={
          <Badge tone={student.isActive ? "green" : "slate"}>
            {student.isActive ? "Active" : "Inactive"}
          </Badge>
        }
      />

      <TabsRow>
        <Tabs
          tabs={filters}
          active={filter}
          onChange={(id) => setFilter(id as TimeFilter)}
        />
        <MetaText>
          Phone {student.phone || "—"} · Hour {student.hourOfPriesthood ?? "—"}
          {student.hourOfPriesthoodEnd ? `–${student.hourOfPriesthoodEnd}` : ""}
        </MetaText>
      </TabsRow>

      {isFacilitator && (
        <GroupsCard
          title="Groups"
          subtitle="A student can be in several groups, but only one per cohort"
        >
          <GroupList>
            {currentGroups.map((g) => (
              <GroupRow key={g.id}>
                <div>
                  <GroupName>{g.name}</GroupName>
                  <CohortLabel>
                    {db.cohorts.find((s) => s.id === g.cohortId)?.name}
                  </CohortLabel>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStudentFromGroup(student.id, g.id)}
                >
                  Remove
                </Button>
              </GroupRow>
            ))}
            {currentGroups.length === 0 && (
              <GroupRow>Not in any group yet.</GroupRow>
            )}
          </GroupList>

          {addableGroups.length > 0 && (
            <AddGroupRow>
              <AddGroupSelectWrap>
                <Select
                  value={addGroupId}
                  onChange={(e) => setAddGroupId(e.target.value)}
                  options={[
                    { value: "", label: "Choose a group to add..." },
                    ...addableGroups.map((g) => ({
                      value: g.id,
                      label: currentCohortIds.has(g.cohortId)
                        ? `${g.name} (same cohort)`
                        : g.name,
                    })),
                  ]}
                />
              </AddGroupSelectWrap>
              <Button
                size="sm"
                onClick={handleAddToGroup}
                disabled={!addGroupId}
              >
                Add to group
              </Button>
            </AddGroupRow>
          )}
          {groupError && <ErrorText>{groupError}</ErrorText>}
        </GroupsCard>
      )}

      <Grid>
        <StudentSummaryCard summary={summary} />

        <Card title="Sign in / out history">
          <Table
            rows={signIns.slice(0, 10)}
            rowKey={(r) => r.id}
            columns={[
              { header: "Date", cell: (r) => formatDate(r.date) },
              {
                header: "In",
                cell: (r) =>
                  r.signedIn ? (
                    <Badge tone="green">{r.timeIn ?? "Yes"}</Badge>
                  ) : (
                    <Badge tone="red">No</Badge>
                  ),
              },
              {
                header: "Out",
                cell: (r) =>
                  r.signedOut ? (
                    <Badge tone="green">{r.timeOut ?? "Yes"}</Badge>
                  ) : (
                    <Badge tone="red">No</Badge>
                  ),
              },
            ]}
            empty={<EmptyText>No sign-in records yet.</EmptyText>}
          />
        </Card>

        <Card title="Attendance records" subtitle="Events and weekly classes">
          <Table
            rows={records}
            rowKey={(r) => r.id}
            columns={[
              { header: "Event", cell: (r) => r.name },
              { header: "Type", cell: (r) => r.type },
              { header: "Date", cell: (r) => formatDate(r.date) },
              {
                header: "Result",
                cell: (r) =>
                  r.attended ? (
                    <Badge tone="green">Attended</Badge>
                  ) : (
                    <Badge tone="red">Absent</Badge>
                  ),
              },
            ]}
            empty={<EmptyText>No attendance records yet.</EmptyText>}
          />
        </Card>

        <Card title="Assignments">
          <Table
            rows={submissions}
            rowKey={(s) => s.id}
            columns={[
              {
                header: "Assignment",
                cell: (s) =>
                  db.assignments.find((a) => a.id === s.assignmentId)?.title ??
                  "—",
              },
              {
                header: "Status",
                cell: (s) =>
                  s.submitted ? (
                    <Badge tone="green">Submitted</Badge>
                  ) : (
                    <Badge tone="red">Not submitted</Badge>
                  ),
              },
              { header: "Grade", cell: (s) => s.grade ?? "—" },
            ]}
            empty={<EmptyText>No assignments yet.</EmptyText>}
          />
        </Card>
      </Grid>

      <FeedbackList studentId={student.id} groupId={student.groupIds[0]} />

      {isFacilitator && (
        <DangerCard title="Danger zone">
          <DangerRow>
            <Button
              variant="secondary"
              onClick={() =>
                student.isActive
                  ? confirm.ask(
                      "Deactivate student?",
                      `${student.name} will be excluded from new assignments, attendance and sign-in marking. Past records stay visible.`,
                      () => toggleActive(student.id),
                      "Deactivate",
                    )
                  : toggleActive(student.id)
              }
            >
              {student.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                confirm.ask(
                  "Delete student?",
                  `${student.name} and every record tied to them (sign-ins, attendance, assignments, payments, feedback) will be permanently deleted. This cannot be undone.`,
                  () => {
                    deleteStudent(student.id);
                    navigate("/groups");
                  },
                  "Delete",
                )
              }
            >
              Delete student
            </Button>
          </DangerRow>
        </DangerCard>
      )}

      <ConfirmModal
        open={confirm.state.open}
        title={confirm.state.title}
        message={confirm.state.message}
        confirmLabel={confirm.state.confirmLabel}
        onConfirm={confirm.state.onConfirm}
        onClose={confirm.close}
      />
    </>
  );
}
