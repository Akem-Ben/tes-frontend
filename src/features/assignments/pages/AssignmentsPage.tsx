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
import { createAssignment, deleteAssignment } from "../api";
import { useGroupParam } from "@/features/groups";
import { useConfirm } from "@/shared/hooks";
import { formatDate, todayISO } from "@/shared/lib";
import type { Recurrence } from "../api/types";

const FilterRow = styled.div`
  margin-bottom: 1rem;
  max-width: 20rem;
`;

const AssignmentList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const AssignmentItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const AssignmentLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const AssignmentMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const AssignmentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StyledForm = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function AssignmentsPage() {
  const db = useDb();
  const { group } = useGroupParam();
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    type: "Message Review",
    dueDate: todayISO(),
    description: "",
    recurrence: "none" as Recurrence,
  });
  const confirm = useConfirm();

  if (!group) {
    return (
      <EmptyState
        icon="📝"
        title="Group not found"
        message="This group no longer exists."
      />
    );
  }

  const all = db.assignments.filter((a) => a.groupId === group.id);
  const assignments = all
    .filter((a) => typeFilter === "all" || a.type === typeFilter)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const types = Array.from(new Set(all.map((a) => a.type)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const activeIds = db.students
      .filter((s) => s.groupIds.includes(group.id) && s.isActive)
      .map((s) => s.id);
    createAssignment({ ...form, groupId: group.id, studentIds: activeIds });
    setOpen(false);
  };

  return (
    <>
      <BackLink to={`/groups/${group.id}`} label={`Back to ${group.name}`} />
      <PageHeader
        title="Assignments"
        subtitle={`${group.name} · Message reviews, book reviews, bible reviews and any other task`}
        action={<Button onClick={() => setOpen(true)}>+ New assignment</Button>}
      />

      <Card>
        <FilterRow>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "All types" },
              ...types.map((t) => ({ value: t, label: t })),
            ]}
          />
        </FilterRow>

        {assignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No assignments yet"
            message="Create an assignment and track who has submitted."
            action={
              <Button onClick={() => setOpen(true)}>Create assignment</Button>
            }
          />
        ) : (
          <AssignmentList>
            {assignments.map((a) => {
              const subs = db.submissions.filter(
                (s) => s.assignmentId === a.id,
              );
              const submitted = subs.filter((s) => s.submitted).length;
              const overdue =
                a.dueDate < todayISO() && submitted < a.studentIds.length;
              return (
                <AssignmentItem key={a.id}>
                  <div>
                    <AssignmentLink
                      to={`/groups/${group.id}/assignments/${a.id}`}
                    >
                      {a.title}
                    </AssignmentLink>
                    <AssignmentMeta>
                      Due {formatDate(a.dueDate)} · {submitted}/
                      {a.studentIds.length} submitted
                    </AssignmentMeta>
                  </div>
                  <AssignmentActions>
                    <Badge tone="brand">{a.type}</Badge>
                    {a.recurrence !== "none" && (
                      <Badge tone="slate">weekly</Badge>
                    )}
                    {a.finishedAt ? (
                      <Badge tone="green">Finished</Badge>
                    ) : a.dueDate >= todayISO() ? (
                      <Badge tone="amber">Upcoming</Badge>
                    ) : overdue ? (
                      <Badge tone="red">Overdue</Badge>
                    ) : (
                      <Badge tone="green">Complete</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        confirm.ask(
                          "Delete assignment?",
                          `"${a.title}" and its submissions will be deleted.`,
                          () => deleteAssignment(a.id),
                          "Delete",
                        )
                      }
                    >
                      Delete
                    </Button>
                  </AssignmentActions>
                </AssignmentItem>
              );
            })}
          </AssignmentList>
        )}
      </Card>

      <Modal
        open={open}
        title="New assignment"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="assignment-form">
              Create assignment
            </Button>
          </>
        }
      >
        <StyledForm id="assignment-form" onSubmit={submit}>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            hint="Any label: Message Review, Book Review, Bible Review..."
            required
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            required
          />
          <Select
            label="Repeats"
            value={form.recurrence}
            onChange={(e) =>
              setForm({ ...form, recurrence: e.target.value as Recurrence })
            }
            options={[
              { value: "none", label: "Does not repeat - ends this week" },
              { value: "weekly", label: "Repeats weekly" },
            ]}
          />
          <Input
            textarea
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <HelpText>
            All active students are included automatically; you can change this
            on the assignment page.
          </HelpText>
        </StyledForm>
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
