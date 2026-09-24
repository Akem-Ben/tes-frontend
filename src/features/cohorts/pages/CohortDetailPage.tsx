import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { Card, Button, Badge, Modal, Input } from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { createGroup } from "@/features/groups/api";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { moveStudentToCohort, removeStudentFromCohortPool } from "../api";
import { formatDate } from "@/shared/lib";

const GroupList = styled.ul`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const GroupRow = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.5rem 0.75rem;
`;

const GroupName = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const GroupMeta = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const PoolCard = styled(Card)`
  margin-top: 1.25rem;
`;

const BulkBar = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;

const PoolList = styled.ul`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const PoolRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.5rem 0.75rem;
`;

const PoolName = styled.span`
  flex: 1;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.text};
`;

const Checkbox = styled.input`
  height: 1rem;
  width: 1rem;
  accent-color: ${({ theme }) => theme.color.brand};
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
  gap: 0.5rem;
`;

const CandidateName = styled.span`
  flex: 1;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.text};
`;

const NoMatchText = styled.li`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function CohortDetailPage() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const db = useDb();
  const { role } = useAuth();
  const facilitatorId = useFacilitatorId();
  const cohort = db.cohorts.find((s) => s.id === cohortId);
  const groups = db.groups.filter((g) => g.cohortId === cohortId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveSelected, setMoveSelected] = useState<Set<string>>(new Set());
  const [poolSelected, setPoolSelected] = useState<Set<string>>(new Set());
  const canManagePool =
    role === "admin" || role === "president" || role === "superadmin";

  if (!cohort) {
    return (
      <EmptyState
        icon="🔍"
        title="Cohort not found"
        message="This cohort no longer exists."
      />
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    createGroup(name, cohort.id, [facilitatorId]);
    setName("");
    setOpen(false);
  };

  const poolStudents = db.students.filter((s) =>
    cohort.studentIds.includes(s.id),
  );
  const waitingCandidates = db.students.filter(
    (s) =>
      db.waitingLists.some((w) => w.studentIds.includes(s.id)) &&
      !cohort.studentIds.includes(s.id),
  );

  const togglePoolSelected = (id: string) =>
    setPoolSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleMoveSelected = (id: string) =>
    setMoveSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkRemoveFromPool = () => {
    poolSelected.forEach((id) => removeStudentFromCohortPool(cohort.id, id));
    setPoolSelected(new Set());
  };

  const bulkMoveIn = () => {
    moveSelected.forEach((id) => moveStudentToCohort(cohort.id, id));
    setMoveSelected(new Set());
    setMoveOpen(false);
  };

  return (
    <>
      <BackLink to="/cohorts" label="Back to Cohorts" />
      <PageHeader
        title={cohort.name}
        subtitle={`${formatDate(cohort.startDate)} → ${formatDate(cohort.endDate)}`}
        action={
          <Badge tone={cohort.status === "active" ? "green" : "slate"}>
            {cohort.status}
          </Badge>
        }
      />

      <Card
        title="Groups in this cohort"
        subtitle={groups.length > 0 ? `${groups.length} group(s)` : undefined}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            + New group
          </Button>
        }
      >
        {groups.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No group yet"
            message="Create a group for this cohort, then add students to it."
            action={<Button onClick={() => setOpen(true)}>Create group</Button>}
          />
        ) : (
          <GroupList>
            {groups.map((group) => {
              const students = db.students.filter((s) =>
                s.groupIds.includes(group.id),
              );
              return (
                <GroupRow key={group.id}>
                  <div>
                    <GroupName>{group.name}</GroupName>
                    <GroupMeta>
                      {students.length} students · {group.facilitatorIds.length}{" "}
                      facilitator(s)
                    </GroupMeta>
                  </div>
                  <Link to={`/groups/${group.id}`}>
                    <Button size="sm">Open group</Button>
                  </Link>
                </GroupRow>
              );
            })}
          </GroupList>
        )}
      </Card>

      <PoolCard
        title="Cohort pool"
        subtitle="Students placed in this cohort but not yet in one of its groups"
        action={
          canManagePool && (
            <Button size="sm" onClick={() => setMoveOpen(true)}>
              + Move from waiting list
            </Button>
          )
        }
      >
        {poolStudents.length === 0 ? (
          <EmptyState
            icon="🕒"
            title="No students in the pool"
            message="Move students in from a waiting list to get started."
          />
        ) : (
          <>
            {poolSelected.size > 0 && (
              <BulkBar>
                <Button size="sm" variant="ghost" onClick={bulkRemoveFromPool}>
                  Remove {poolSelected.size} from pool
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPoolSelected(new Set())}
                >
                  Clear
                </Button>
              </BulkBar>
            )}
            <PoolList>
              {poolStudents.map((s) => (
                <PoolRow key={s.id}>
                  <Checkbox
                    type="checkbox"
                    checked={poolSelected.has(s.id)}
                    onChange={() => togglePoolSelected(s.id)}
                  />
                  <PoolName>
                    {s.name} <Badge tone="slate">{s.registrationNumber}</Badge>
                  </PoolName>
                </PoolRow>
              ))}
            </PoolList>
          </>
        )}
      </PoolCard>

      <Modal
        open={open}
        title="Create group"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="group-form">
              Create group
            </Button>
          </>
        }
      >
        <form id="group-form" onSubmit={submit}>
          <Input
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group 2 - Zion"
            required
          />
        </form>
      </Modal>

      <Modal
        open={moveOpen}
        title="Move from waiting list"
        onClose={() => setMoveOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button disabled={moveSelected.size === 0} onClick={bulkMoveIn}>
              Move {moveSelected.size || ""} in
            </Button>
          </>
        }
      >
        <CandidateList>
          {waitingCandidates.map((s) => (
            <CandidateRow key={s.id}>
              <Checkbox
                type="checkbox"
                checked={moveSelected.has(s.id)}
                onChange={() => toggleMoveSelected(s.id)}
              />
              <CandidateName>
                {s.name} · {s.registrationNumber}
              </CandidateName>
            </CandidateRow>
          ))}
          {waitingCandidates.length === 0 && (
            <NoMatchText>
              No students are currently on a waiting list.
            </NoMatchText>
          )}
        </CandidateList>
      </Modal>
    </>
  );
}
