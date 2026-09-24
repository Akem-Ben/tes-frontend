import { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  MarkToggle,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { finishAssignment, setSubmission, updateAssignment } from "../api";
import { useConfirm } from "@/shared/hooks";
import { formatDate, todayISO } from "@/shared/lib";

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DescriptionCard = styled(Card)`
  margin-bottom: 1rem;
`;

const DescriptionText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const SubmissionList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const SubmissionItem = styled.li`
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const SubmissionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const StudentInfo = styled.div`
  min-width: 0;
`;

const StudentName = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const StudentMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const SubmissionFields = styled.div`
  margin-top: 0.75rem;
  display: grid;
  gap: 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const EditList = styled.ul`
  margin-top: 0.75rem;

  > * + * {
    margin-top: 0.25rem;
  }
`;

const EditItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
`;

const EditItemLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const Checkbox = styled.input`
  height: 1rem;
  width: 1rem;
  accent-color: ${({ theme }) => theme.color.brand};
`;

export function AssignmentDetailPage() {
  const { assignmentId = "" } = useParams<{ assignmentId: string }>();
  const db = useDb();
  const assignment = db.assignments.find((a) => a.id === assignmentId);
  const [editOpen, setEditOpen] = useState(false);
  const confirm = useConfirm();

  if (!assignment) {
    return (
      <EmptyState
        icon="🔍"
        title="Assignment not found"
        message="This assignment no longer exists."
      />
    );
  }

  const locked = Boolean(assignment.finishedAt);
  const groupStudents = db.students.filter((s) =>
    s.groupIds.includes(assignment.groupId),
  );
  const included = groupStudents.filter((s) =>
    assignment.studentIds.includes(s.id),
  );
  const subs = db.submissions.filter((s) => s.assignmentId === assignment.id);

  return (
    <>
      <BackLink
        to={`/groups/${assignment.groupId}/assignments`}
        label="Back to Assignments"
      />
      <PageHeader
        title={assignment.title}
        subtitle={`${assignment.type} · due ${formatDate(assignment.dueDate)}`}
        action={
          <HeaderActions>
            {locked && <Badge tone="green">Finished</Badge>}
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit students
            </Button>
            {!locked && (
              <Button
                variant="secondary"
                onClick={() =>
                  confirm.ask(
                    "Mark this week finished?",
                    "Once finished this assignment can no longer be edited, even by a facilitator, president or admin.",
                    () => finishAssignment(assignment.id),
                    "Finish",
                  )
                }
              >
                Mark finished
              </Button>
            )}
          </HeaderActions>
        }
      />

      {assignment.description && (
        <DescriptionCard>
          <DescriptionText>{assignment.description}</DescriptionText>
        </DescriptionCard>
      )}

      <Card title="Submissions">
        {included.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No students included"
            message="Use Edit students to include students."
          />
        ) : (
          <SubmissionList>
            {included.map((s) => {
              const sub = subs.find((x) => x.studentId === s.id);
              return (
                <SubmissionItem key={s.id}>
                  <SubmissionRow>
                    <StudentInfo>
                      <StudentName>{s.name}</StudentName>
                      <StudentMeta>{s.registrationNumber}</StudentMeta>
                    </StudentInfo>
                    <MarkToggle
                      value={sub ? sub.submitted : null}
                      yesLabel="Submitted"
                      noLabel="Not yet"
                      disabled={locked}
                      onChange={(v) =>
                        setSubmission(assignment.id, s.id, {
                          submitted: v,
                          dateSubmitted: v ? todayISO() : undefined,
                        })
                      }
                    />
                  </SubmissionRow>
                  {sub?.submitted && (
                    <SubmissionFields>
                      <Input
                        label="Grade"
                        value={sub.grade ?? ""}
                        disabled={locked}
                        onChange={(e) =>
                          setSubmission(assignment.id, s.id, {
                            grade: e.target.value,
                          })
                        }
                        placeholder="A"
                      />
                      <Input
                        label="Notes"
                        value={sub.notes ?? ""}
                        disabled={locked}
                        onChange={(e) =>
                          setSubmission(assignment.id, s.id, {
                            notes: e.target.value,
                          })
                        }
                      />
                    </SubmissionFields>
                  )}
                </SubmissionItem>
              );
            })}
          </SubmissionList>
        )}
      </Card>

      <Modal
        open={editOpen}
        title="Students included"
        onClose={() => setEditOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setEditOpen(false)}>
            Done
          </Button>
        }
      >
        <Button
          size="sm"
          variant="secondary"
          disabled={locked}
          onClick={() =>
            updateAssignment(assignment.id, {
              studentIds: groupStudents
                .filter((s) => s.isActive)
                .map((s) => s.id),
            })
          }
        >
          Add all active students
        </Button>
        <EditList>
          {groupStudents.map((s) => (
            <EditItem key={s.id}>
              <EditItemLabel>{s.name}</EditItemLabel>
              <Checkbox
                type="checkbox"
                checked={assignment.studentIds.includes(s.id)}
                disabled={locked}
                onChange={() =>
                  updateAssignment(assignment.id, {
                    studentIds: assignment.studentIds.includes(s.id)
                      ? assignment.studentIds.filter((x) => x !== s.id)
                      : [...assignment.studentIds, s.id],
                  })
                }
              />
            </EditItem>
          ))}
        </EditList>
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
