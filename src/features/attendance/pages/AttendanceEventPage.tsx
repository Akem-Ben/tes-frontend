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
  Select,
  MarkToggle,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import {
  addStudentsToEvent,
  finishEvent,
  mark,
  markAllPresent,
  removeStudentFromEvent,
  updateEvent,
} from "../api";
import { useConfirm } from "@/shared/hooks";
import { formatDateTime, isPast } from "@/shared/lib";
import type { Recurrence } from "../api/types";

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const StudentList = styled.ul`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const StudentItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
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

const FormStack = styled.div`
  > * + * {
    margin-top: 1rem;
  }
`;

const FieldGroup = styled.div``;

const FieldHeader = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FieldLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.textBody};
`;

const CutoffNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const EditList = styled.ul`
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

export function AttendanceEventPage() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const db = useDb();
  const event = db.attendanceEvents.find((e) => e.id === eventId);
  const [editOpen, setEditOpen] = useState(false);
  const confirm = useConfirm();

  if (!event) {
    return (
      <EmptyState
        icon="🔍"
        title="Event not found"
        message="This event no longer exists."
      />
    );
  }

  const groupStudents = db.students.filter((s) =>
    s.groupIds.includes(event.groupId),
  );
  const included = groupStudents.filter((s) => event.studentIds.includes(s.id));
  const records = db.attendanceRecords.filter(
    (r) => r.attendanceEventId === event.id,
  );
  const attended = records.filter((r) => r.attended).length;
  const cutoffPassed = isPast(event.date);
  const locked = Boolean(event.finishedAt);

  const toggleStudent = (id: string) =>
    event.studentIds.includes(id)
      ? removeStudentFromEvent(event.id, id)
      : addStudentsToEvent(event.id, [id]);

  return (
    <>
      <BackLink
        to={`/groups/${event.groupId}/attendance`}
        label="Back to Attendance"
      />
      <PageHeader
        title={event.name}
        subtitle={`${formatDateTime(event.date)} · ${event.type}`}
        action={
          <HeaderActions>
            {event.finishedAt && <Badge tone="green">Finished</Badge>}
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button onClick={() => markAllPresent(event.id)} disabled={locked}>
              Mark all present
            </Button>
            {!locked && (
              <Button
                variant="secondary"
                onClick={() =>
                  confirm.ask(
                    "Mark this week finished?",
                    "Once finished this event can no longer be edited, even by a facilitator, president or admin.",
                    () => finishEvent(event.id),
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

      <Card
        title="Mark attendance"
        subtitle={`${attended} of ${included.length} marked present`}
      >
        {included.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No students in this event"
            message="Use Edit to add students to this event."
            action={
              <Button onClick={() => setEditOpen(true)}>Add students</Button>
            }
          />
        ) : (
          <StudentList>
            {included.map((s) => {
              const record = records.find((r) => r.studentId === s.id);
              return (
                <StudentItem key={s.id}>
                  <StudentInfo>
                    <StudentName>{s.name}</StudentName>
                    <StudentMeta>{s.registrationNumber}</StudentMeta>
                  </StudentInfo>
                  <MarkToggle
                    value={record ? record.attended : null}
                    disabled={locked}
                    onChange={(v) => mark(event.id, s.id, v)}
                  />
                </StudentItem>
              );
            })}
          </StudentList>
        )}
      </Card>

      <Modal
        open={editOpen}
        title="Edit event"
        onClose={() => setEditOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setEditOpen(false)}>
            Done
          </Button>
        }
      >
        <FormStack>
          <Input
            label="Name"
            value={event.name}
            disabled={locked}
            onChange={(e) => updateEvent(event.id, { name: e.target.value })}
          />
          <Input
            label="Type"
            value={event.type}
            disabled={locked}
            onChange={(e) => updateEvent(event.id, { type: e.target.value })}
          />
          <Input
            label="Date & time"
            type="datetime-local"
            value={event.date}
            disabled={locked}
            onChange={(e) => updateEvent(event.id, { date: e.target.value })}
          />
          <Select
            label="Repeats"
            value={event.recurrence}
            disabled={locked}
            onChange={(e) =>
              updateEvent(event.id, {
                recurrence: e.target.value as Recurrence,
              })
            }
            options={[
              { value: "none", label: "Does not repeat - ends this week" },
              { value: "weekly", label: "Repeats weekly" },
            ]}
          />
          <FieldGroup>
            <FieldHeader>
              <FieldLabel>Students</FieldLabel>
              {!cutoffPassed && !locked && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    addStudentsToEvent(
                      event.id,
                      groupStudents.filter((s) => s.isActive).map((s) => s.id),
                    )
                  }
                >
                  Add all
                </Button>
              )}
            </FieldHeader>
            {cutoffPassed && !locked && (
              <CutoffNote>
                The event time has passed - students can be removed but no
                longer added.
              </CutoffNote>
            )}
            <EditList>
              {groupStudents.map((s) => {
                const isIncluded = event.studentIds.includes(s.id);
                const disableAdd = !isIncluded && (cutoffPassed || locked);
                return (
                  <EditItem key={s.id}>
                    <EditItemLabel>
                      {s.name}{" "}
                      {!s.isActive && <Badge tone="slate">Inactive</Badge>}
                    </EditItemLabel>
                    <Checkbox
                      type="checkbox"
                      checked={isIncluded}
                      disabled={locked || disableAdd}
                      onChange={() => toggleStudent(s.id)}
                    />
                  </EditItem>
                );
              })}
            </EditList>
          </FieldGroup>
        </FormStack>
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
