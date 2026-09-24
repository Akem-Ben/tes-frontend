import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { createClass, deleteClass } from "../api";
import { DAY_LABELS } from "../api/types";
import { useGroupParam } from "@/features/groups";
import { useConfirm } from "@/shared/hooks";

const ClassList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const ClassItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const ClassLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const ClassMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const ClassActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const TimeGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function WeeklyClassesPage() {
  const db = useDb();
  const { group } = useGroupParam();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dayOfWeek: "2",
    time: "16:00",
    description: "",
  });
  const confirm = useConfirm();

  if (!group) {
    return (
      <EmptyState
        icon="📖"
        title="Group not found"
        message="This group no longer exists."
      />
    );
  }

  const classes = db.weeklyClasses
    .filter((c) => c.groupId === group.id)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const activeIds = db.students
      .filter((s) => s.groupIds.includes(group.id) && s.isActive)
      .map((s) => s.id);
    createClass({
      name: form.name,
      groupId: group.id,
      dayOfWeek: Number(form.dayOfWeek),
      time: form.time,
      description: form.description || undefined,
      studentIds: activeIds,
    });
    setForm({ name: "", dayOfWeek: "2", time: "16:00", description: "" });
    setOpen(false);
  };

  return (
    <>
      <BackLink to={`/groups/${group.id}`} label={`Back to ${group.name}`} />
      <PageHeader
        title="Weekly Classes"
        subtitle={`${group.name} · Standing classes that hold every week`}
        action={<Button onClick={() => setOpen(true)}>+ New class</Button>}
      />

      <Card>
        {classes.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No weekly classes yet"
            message="Set up a class, add your group, and mark attendance each week."
            action={<Button onClick={() => setOpen(true)}>Create class</Button>}
          />
        ) : (
          <ClassList>
            {classes.map((c) => (
              <ClassItem key={c.id}>
                <div>
                  <ClassLink to={`/groups/${group.id}/classes/${c.id}`}>
                    {c.name}
                  </ClassLink>
                  <ClassMeta>
                    Every {DAY_LABELS[c.dayOfWeek]} at {c.time} ·{" "}
                    {c.studentIds.length} students
                  </ClassMeta>
                </div>
                <ClassActions>
                  {!c.isActive && <Badge tone="slate">Paused</Badge>}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      confirm.ask(
                        "Delete class?",
                        `"${c.name}" and all its attendance records will be deleted.`,
                        () => deleteClass(c.id),
                        "Delete",
                      )
                    }
                  >
                    Delete
                  </Button>
                </ClassActions>
              </ClassItem>
            ))}
          </ClassList>
        )}
      </Card>

      <Modal
        open={open}
        title="New weekly class"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="class-form">
              Create class
            </Button>
          </>
        }
      >
        <Form id="class-form" onSubmit={submit}>
          <Input
            label="Class name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Doctrine Class"
            required
          />
          <TimeGrid>
            <Select
              label="Day of the week"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              options={DAY_LABELS.map((label, i) => ({
                value: String(i),
                label,
              }))}
            />
            <Input
              label="Time"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </TimeGrid>
          <Input
            textarea
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <HelpText>
            All active students in this group are added automatically; you can
            change this on the class page.
          </HelpText>
        </Form>
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
