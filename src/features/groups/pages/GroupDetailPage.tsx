import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Tabs,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb, listRedundantStudents } from "@/shared/lib";
import { addStudentToGroup } from "@/features/students/api";
import { removeStudentFromAllWaitingLists } from "@/features/waiting-list";
import { addFacilitator, removeFacilitator, updateGroup } from "../api";
import { useConfirm } from "@/shared/hooks";
import { media } from "@/theme";
import type { Student } from "@/shared/lib/mockStore";

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const SpacedCard = styled(Card)`
  margin-top: 1.25rem;
`;

const FacilitatorList = styled.ul`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const FacilitatorRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.5rem 0.75rem;
`;

const FacilitatorName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const FacilitatorEmail = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const StudentList = styled.ul`
  > li {
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  }
  > li:last-child {
    border-bottom: 0;
  }
`;

const StudentRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0;
`;

const StudentLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};

  &:hover {
    color: ${({ theme }) => theme.color.brand};
  }
`;

const RegNumber = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textSoft};
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

const ToolLink = styled(Link)`
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

const ToolIcon = styled.span`
  font-size: 1.25rem;
`;

const CandidateList = styled.ul`
  margin-top: 1rem;

  > * + * {
    margin-top: 0.5rem;
  }
`;

const CandidateRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const NoMatchText = styled.li`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const PoolErrorText = styled.p`
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.danger};
`;

const RenameForm = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const groupTools = (groupId: string) => [
  { to: `/groups/${groupId}/students`, label: "Students", icon: "🎓" },
  { to: `/groups/${groupId}/signinout`, label: "Sign In/Out", icon: "⏰" },
  { to: `/groups/${groupId}/attendance`, label: "Attendance", icon: "✅" },
  { to: `/groups/${groupId}/classes`, label: "Weekly Classes", icon: "📖" },
  { to: `/groups/${groupId}/assignments`, label: "Assignments", icon: "📝" },
  { to: `/groups/${groupId}/retreats`, label: "Retreats", icon: "⛺" },
  { to: `/groups/${groupId}/feedback`, label: "Feedback", icon: "💬" },
  { to: `/groups/${groupId}/analytics`, label: "Analytics", icon: "📊" },
];

const poolTabs = [
  { id: "waiting", label: "Waiting List" },
  { id: "redundant", label: "Redundant" },
  { id: "cohort", label: "Cohort" },
];

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const db = useDb();
  const group = db.groups.find((g) => g.id === groupId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState("");
  const [poolOpen, setPoolOpen] = useState(false);
  const [poolTab, setPoolTab] = useState("waiting");
  const [poolError, setPoolError] = useState("");
  const confirm = useConfirm();

  if (!group) {
    return (
      <EmptyState
        icon="🔍"
        title="Group not found"
        message="This group no longer exists."
      />
    );
  }

  const students = db.students.filter((s) => s.groupIds.includes(group.id));
  const coFacilitators = db.facilitators.filter((f) =>
    group.facilitatorIds.includes(f.id),
  );
  const candidates = db.facilitators.filter(
    (f) =>
      !group.facilitatorIds.includes(f.id) &&
      (f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.email.toLowerCase().includes(query.toLowerCase())),
  );
  const cohort = db.cohorts.find((s) => s.id === group.cohortId);

  const waitingCandidates = db.students.filter(
    (s) =>
      db.waitingLists.some((w) => w.studentIds.includes(s.id)) &&
      !s.groupIds.includes(group.id),
  );
  const redundantCandidates = listRedundantStudents();
  const cohortCandidates = db.students.filter(
    (s) =>
      (cohort?.studentIds ?? []).includes(s.id) &&
      !s.groupIds.includes(group.id),
  );
  const poolCandidates =
    poolTab === "waiting"
      ? waitingCandidates
      : poolTab === "cohort"
        ? cohortCandidates
        : redundantCandidates;

  const addFromPool = (student: Student) => {
    try {
      addStudentToGroup(student.id, group.id);
      if (poolTab === "waiting") removeStudentFromAllWaitingLists(student.id);
      setPoolError("");
    } catch (err) {
      setPoolError(
        err instanceof Error ? err.message : "Could not add student.",
      );
    }
  };

  return (
    <>
      <BackLink to="/groups" label="Back to Groups" />
      <PageHeader
        title={group.name}
        subtitle={cohort ? `Cohort: ${cohort.name}` : undefined}
        action={
          <HeaderActions>
            <Badge tone={group.isActive ? "green" : "slate"}>
              {group.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="secondary"
              onClick={() => {
                setName(group.name);
                setRenameOpen(true);
              }}
            >
              Rename
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                updateGroup(group.id, { isActive: !group.isActive })
              }
            >
              {group.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="secondary" onClick={() => setPoolOpen(true)}>
              + Add existing student
            </Button>
            <Button onClick={() => setOpen(true)}>+ Add facilitator</Button>
          </HeaderActions>
        }
      />

      <StatGrid>
        <Card>
          <StatLabel>Students</StatLabel>
          <StatValue>{students.length}</StatValue>
        </Card>
        <Card>
          <StatLabel>Active</StatLabel>
          <StatValue>{students.filter((s) => s.isActive).length}</StatValue>
        </Card>
        <Card>
          <StatLabel>Events</StatLabel>
          <StatValue>
            {db.attendanceEvents.filter((e) => e.groupId === group.id).length}
          </StatValue>
        </Card>
        <Card>
          <StatLabel>Assignments</StatLabel>
          <StatValue>
            {db.assignments.filter((a) => a.groupId === group.id).length}
          </StatValue>
        </Card>
      </StatGrid>

      <SpacedCard
        title="Co-facilitators"
        subtitle="Everyone here has equal permissions"
      >
        <FacilitatorList>
          {coFacilitators.map((f) => (
            <FacilitatorRow key={f.id}>
              <div>
                <FacilitatorName>{f.name}</FacilitatorName>
                <FacilitatorEmail>{f.email}</FacilitatorEmail>
              </div>
              {group.facilitatorIds.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    confirm.ask(
                      "Remove facilitator?",
                      `${f.name} will lose access to ${group.name}.`,
                      () => removeFacilitator(group.id, f.id),
                      "Remove",
                    )
                  }
                >
                  Remove
                </Button>
              )}
            </FacilitatorRow>
          ))}
        </FacilitatorList>
      </SpacedCard>

      <SpacedCard title="Students in this group">
        {students.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No students yet"
            message="Add your students to start marking attendance and assignments."
            action={
              <Link to={`/groups/${group.id}/students`}>
                <Button>Add students</Button>
              </Link>
            }
          />
        ) : (
          <StudentList>
            {students.map((s) => (
              <StudentRow key={s.id}>
                <StudentLink to={`/students/${s.id}`}>
                  {s.name}
                  <RegNumber>{s.registrationNumber}</RegNumber>
                </StudentLink>
                <Badge tone={s.isActive ? "green" : "slate"}>
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
              </StudentRow>
            ))}
          </StudentList>
        )}
      </SpacedCard>

      <SpacedCard title="Group tools">
        <ToolsGrid>
          {groupTools(group.id).map((l) => (
            <ToolLink key={l.to} to={l.to}>
              <ToolIcon aria-hidden>{l.icon}</ToolIcon>
              {l.label}
            </ToolLink>
          ))}
        </ToolsGrid>
      </SpacedCard>

      <Modal
        open={open}
        title="Add a facilitator"
        onClose={() => setOpen(false)}
      >
        <Input
          label="Search facilitators"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or email"
        />
        <CandidateList>
          {candidates.map((f) => (
            <CandidateRow key={f.id}>
              <div>
                <FacilitatorName>{f.name}</FacilitatorName>
                <FacilitatorEmail>{f.email}</FacilitatorEmail>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  addFacilitator(group.id, f.id);
                  setOpen(false);
                }}
              >
                Add
              </Button>
            </CandidateRow>
          ))}
          {candidates.length === 0 && (
            <NoMatchText>No matching facilitators.</NoMatchText>
          )}
        </CandidateList>
      </Modal>

      <Modal
        open={renameOpen}
        title="Rename group"
        onClose={() => setRenameOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="rename-group-form">
              Save
            </Button>
          </>
        }
      >
        <RenameForm
          id="rename-group-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) updateGroup(group.id, { name: name.trim() });
            setRenameOpen(false);
          }}
        >
          <Input
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brigade 1"
            required
          />
        </RenameForm>
      </Modal>

      <Modal
        open={poolOpen}
        title="Add an existing student"
        onClose={() => setPoolOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setPoolOpen(false)}>
            Done
          </Button>
        }
      >
        <Tabs tabs={poolTabs} active={poolTab} onChange={setPoolTab} />
        <CandidateList>
          {poolCandidates.map((s) => (
            <CandidateRow key={s.id}>
              <div>
                <FacilitatorName>{s.name}</FacilitatorName>
                <FacilitatorEmail>{s.registrationNumber}</FacilitatorEmail>
              </div>
              <Button size="sm" onClick={() => addFromPool(s)}>
                Add
              </Button>
            </CandidateRow>
          ))}
          {poolCandidates.length === 0 && (
            <NoMatchText>No students here right now.</NoMatchText>
          )}
        </CandidateList>
        {poolError && <PoolErrorText>{poolError}</PoolErrorText>}
      </Modal>

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
