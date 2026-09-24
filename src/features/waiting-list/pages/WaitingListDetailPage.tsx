import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  Table,
  type Column,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb, listRedundantStudents } from "@/shared/lib";
import { useAuth } from "@/features/auth";
import {
  addFacilitatorToWaitingList,
  addStudentToWaitingList,
  removeFacilitatorFromWaitingList,
  removeStudentFromWaitingList,
} from "../api";
import { moveStudentToCohort } from "@/features/cohorts/api";
import type { Student } from "@/shared/lib/mockStore";

const FacilitatorBadges = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;

const RemoveFacilitatorButton = styled.button`
  margin-left: 0.25rem;
  font-size: 0.75rem;
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

const CandidateName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const CandidateMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const NoMatchText = styled.li`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const StudentLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const BulkBar = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.tone.brand.bg};
  padding: 0.625rem 0.75rem;
`;

const BulkText = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const BulkSelectWrap = styled.div`
  width: 12rem;
`;

const Checkbox = styled.input`
  height: 1rem;
  width: 1rem;
  accent-color: ${({ theme }) => theme.color.brand};
`;

export function WaitingListDetailPage() {
  const { waitingListId } = useParams<{ waitingListId: string }>();
  const db = useDb();
  const { role } = useAuth();
  const waitingList = db.waitingLists.find((w) => w.id === waitingListId);
  const [addOpen, setAddOpen] = useState(false);
  const [facilitatorOpen, setFacilitatorOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveCohortId, setMoveCohortId] = useState("");

  const canManage = role === "facilitator" || role === "admin";
  const canAssignFacilitator = role === "admin";
  const canMoveToCohort = role === "admin" || role === "president";

  if (!waitingList) {
    return (
      <EmptyState
        icon="🔍"
        title="Waiting list not found"
        message="This waiting list no longer exists."
      />
    );
  }

  const members = db.students.filter((s) =>
    waitingList.studentIds.includes(s.id),
  );
  const assignedFacilitators = db.facilitators.filter((f) =>
    waitingList.facilitatorIds.includes(f.id),
  );
  const candidateFacilitators = db.facilitators.filter(
    (f) => !waitingList.facilitatorIds.includes(f.id),
  );
  const candidateStudents = listRedundantStudents().filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkRemove = () => {
    selected.forEach((id) => removeStudentFromWaitingList(waitingList.id, id));
    setSelected(new Set());
  };

  const bulkMoveToCohort = () => {
    if (!moveCohortId) return;
    selected.forEach((id) => moveStudentToCohort(moveCohortId, id));
    setSelected(new Set());
  };

  const columns: Array<Column<Student>> = [
    ...(canManage || canMoveToCohort
      ? [
          {
            header: "",
            cell: (s: Student) => (
              <Checkbox
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggleSelected(s.id)}
              />
            ),
          },
        ]
      : []),
    {
      header: "Student",
      cell: (s) => <StudentLink to={`/students/${s.id}`}>{s.name}</StudentLink>,
    },
    { header: "Reg. number", cell: (s) => s.registrationNumber },
    { header: "Phone", cell: (s) => s.phone || "—" },
    {
      header: "Status",
      cell: (s) => (
        <Badge tone={s.isActive ? "green" : "slate"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            cell: (s: Student) => (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  removeStudentFromWaitingList(waitingList.id, s.id)
                }
              >
                Remove
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <BackLink to="/waiting-list" label="Back to Waiting List" />
      <PageHeader
        title={waitingList.name}
        subtitle={`${members.length} students waiting`}
        action={
          <>
            {canAssignFacilitator && (
              <Button
                variant="secondary"
                onClick={() => setFacilitatorOpen(true)}
              >
                + Assign facilitator
              </Button>
            )}{" "}
            {canManage && (
              <Button onClick={() => setAddOpen(true)}>+ Add student</Button>
            )}
          </>
        }
      />

      {assignedFacilitators.length > 0 && (
        <FacilitatorBadges>
          {assignedFacilitators.map((f) => (
            <Badge key={f.id} tone="brand">
              {f.name}
              {canAssignFacilitator && (
                <RemoveFacilitatorButton
                  onClick={() =>
                    removeFacilitatorFromWaitingList(waitingList.id, f.id)
                  }
                  aria-label={`Remove ${f.name}`}
                >
                  ✕
                </RemoveFacilitatorButton>
              )}
            </Badge>
          ))}
        </FacilitatorBadges>
      )}

      {selected.size > 0 && (
        <BulkBar>
          <BulkText>{selected.size} selected</BulkText>
          {canMoveToCohort && (
            <>
              <BulkSelectWrap>
                <Select
                  value={moveCohortId}
                  onChange={(e) => setMoveCohortId(e.target.value)}
                  options={[
                    { value: "", label: "Move to cohort..." },
                    ...db.cohorts.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </BulkSelectWrap>
              <Button
                size="sm"
                disabled={!moveCohortId}
                onClick={bulkMoveToCohort}
              >
                Move
              </Button>
            </>
          )}
          {canManage && (
            <Button size="sm" variant="ghost" onClick={bulkRemove}>
              Remove from list
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </BulkBar>
      )}

      <Card>
        <Table
          columns={columns}
          rows={members}
          rowKey={(s) => s.id}
          empty={
            <EmptyState
              icon="🕒"
              title="No students waiting"
              message="Add students from the redundant list to get started."
            />
          }
        />
      </Card>

      <Modal
        open={addOpen}
        title="Add a student"
        onClose={() => setAddOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setAddOpen(false)}>
            Done
          </Button>
        }
      >
        <Input
          label="Search students"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or reg. number"
        />
        <CandidateList>
          {candidateStudents.map((s) => (
            <CandidateRow key={s.id}>
              <div>
                <CandidateName>{s.name}</CandidateName>
                <CandidateMeta>{s.registrationNumber}</CandidateMeta>
              </div>
              <Button
                size="sm"
                onClick={() => addStudentToWaitingList(waitingList.id, s.id)}
              >
                Add
              </Button>
            </CandidateRow>
          ))}
          {candidateStudents.length === 0 && (
            <NoMatchText>No unplaced students match.</NoMatchText>
          )}
        </CandidateList>
      </Modal>

      <Modal
        open={facilitatorOpen}
        title="Assign a facilitator"
        onClose={() => setFacilitatorOpen(false)}
      >
        <CandidateList>
          {candidateFacilitators.map((f) => (
            <CandidateRow key={f.id}>
              <div>
                <CandidateName>{f.name}</CandidateName>
                <CandidateMeta>{f.email}</CandidateMeta>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  addFacilitatorToWaitingList(waitingList.id, f.id);
                  setFacilitatorOpen(false);
                }}
              >
                Assign
              </Button>
            </CandidateRow>
          ))}
          {candidateFacilitators.length === 0 && (
            <NoMatchText>Every facilitator is already assigned.</NoMatchText>
          )}
        </CandidateList>
      </Modal>
    </>
  );
}
