import { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  MarkToggle,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { markAllPresent, markAttendance, updateClass } from "../api";
import { DAY_LABELS } from "../api/types";
import { formatDate, todayISO } from "@/shared/lib";

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DateRow = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
`;

const DateText = styled.p`
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
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

export function WeeklyClassDetailPage() {
  const { classId = "" } = useParams<{ classId: string }>();
  const db = useDb();
  const weeklyClass = db.weeklyClasses.find((c) => c.id === classId);
  const [date, setDate] = useState(todayISO());
  const [editOpen, setEditOpen] = useState(false);

  if (!weeklyClass) {
    return (
      <EmptyState
        icon="🔍"
        title="Class not found"
        message="This class no longer exists."
      />
    );
  }

  const groupStudents = db.students.filter((s) =>
    s.groupIds.includes(weeklyClass.groupId),
  );
  const included = groupStudents.filter((s) =>
    weeklyClass.studentIds.includes(s.id),
  );
  const records = db.weeklyClassAttendance.filter(
    (r) => r.weeklyClassId === weeklyClass.id && r.date === date,
  );
  const attended = records.filter((r) => r.attended).length;

  const toggleStudent = (id: string) =>
    updateClass(weeklyClass.id, {
      studentIds: weeklyClass.studentIds.includes(id)
        ? weeklyClass.studentIds.filter((s) => s !== id)
        : [...weeklyClass.studentIds, id],
    });

  return (
    <>
      <BackLink
        to={`/groups/${weeklyClass.groupId}/classes`}
        label="Back to Weekly Classes"
      />
      <PageHeader
        title={weeklyClass.name}
        subtitle={`Every ${DAY_LABELS[weeklyClass.dayOfWeek]} at ${weeklyClass.time}`}
        action={
          <HeaderActions>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                updateClass(weeklyClass.id, { isActive: !weeklyClass.isActive })
              }
            >
              {weeklyClass.isActive ? "Pause" : "Resume"}
            </Button>
            <Button onClick={() => markAllPresent(weeklyClass.id, date)}>
              Mark all present
            </Button>
          </HeaderActions>
        }
      />

      <Card>
        <DateRow>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <DateText>{formatDate(date)}</DateText>
        </DateRow>

        <Card
          title="Mark attendance"
          subtitle={`${attended} of ${included.length} marked present`}
        >
          {included.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No students in this class"
              message="Use Edit to add students."
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
                      onChange={(v) =>
                        markAttendance(weeklyClass.id, s.id, date, v)
                      }
                    />
                  </StudentItem>
                );
              })}
            </StudentList>
          )}
        </Card>
      </Card>

      <Modal
        open={editOpen}
        title="Edit class"
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
            value={weeklyClass.name}
            onChange={(e) =>
              updateClass(weeklyClass.id, { name: e.target.value })
            }
          />
          <Select
            label="Day of the week"
            value={String(weeklyClass.dayOfWeek)}
            onChange={(e) =>
              updateClass(weeklyClass.id, { dayOfWeek: Number(e.target.value) })
            }
            options={DAY_LABELS.map((label, i) => ({
              value: String(i),
              label,
            }))}
          />
          <Input
            label="Time"
            type="time"
            value={weeklyClass.time}
            onChange={(e) =>
              updateClass(weeklyClass.id, { time: e.target.value })
            }
          />
          <FieldGroup>
            <FieldHeader>
              <FieldLabel>Students</FieldLabel>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  updateClass(weeklyClass.id, {
                    studentIds: groupStudents
                      .filter((s) => s.isActive)
                      .map((s) => s.id),
                  })
                }
              >
                Add all
              </Button>
            </FieldHeader>
            <EditList>
              {groupStudents.map((s) => (
                <EditItem key={s.id}>
                  <EditItemLabel>
                    {s.name}{" "}
                    {!s.isActive && <Badge tone="slate">Inactive</Badge>}
                  </EditItemLabel>
                  <Checkbox
                    type="checkbox"
                    checked={weeklyClass.studentIds.includes(s.id)}
                    onChange={() => toggleStudent(s.id)}
                  />
                </EditItem>
              ))}
            </EditList>
          </FieldGroup>
        </FormStack>
      </Modal>
    </>
  );
}
