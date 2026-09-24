import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Modal,
  Select,
  Input,
  Table,
  type Column,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { useActiveGroup, useGroupParam } from "@/features/groups";
import { formatDate, todayISO } from "@/shared/lib";
import { createFeedback, listAllFeedback, listFeedbackForGroups } from "../api";
import type { Feedback } from "../api/types";

const FilterRow = styled.div`
  margin-bottom: 1rem;
  display: grid;
  gap: 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 32rem;
  }
`;

const StudentLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const MessageCell = styled.p`
  max-width: 28rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

export function FeedbackPage() {
  const db = useDb();
  const { role } = useAuth();
  const facilitatorId = useFacilitatorId();
  const { groups } = useActiveGroup();
  const { group: paramGroup } = useGroupParam();
  const isGroupScoped = Boolean(paramGroup);
  const isOrgWide =
    !isGroupScoped &&
    (role === "president" || role === "admin" || role === "superadmin");
  const canAdd = role === "facilitator";
  const [studentFilter, setStudentFilter] = useState("all");
  const [facilitatorFilter, setFacilitatorFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    date: todayISO(),
    message: "",
  });

  const ownGroupIds = groups.map((g) => g.id);
  const scoped = isGroupScoped
    ? listFeedbackForGroups([paramGroup!.id])
    : isOrgWide
      ? listAllFeedback()
      : listFeedbackForGroups(ownGroupIds);
  const items = scoped
    .filter((f) => studentFilter === "all" || f.studentId === studentFilter)
    .filter(
      (f) =>
        facilitatorFilter === "all" || f.facilitatorId === facilitatorFilter,
    );

  const eligibleStudents = isGroupScoped
    ? db.students.filter((s) => s.groupIds.includes(paramGroup!.id))
    : isOrgWide
      ? db.students
      : db.students.filter((s) =>
          ownGroupIds.some((g) => s.groupIds.includes(g)),
        );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const student = db.students.find((s) => s.id === form.studentId);
    const groupId =
      (isGroupScoped ? paramGroup!.id : undefined) ??
      ownGroupIds.find((g) => student?.groupIds.includes(g));
    if (!form.studentId || !groupId) return;
    createFeedback({
      studentId: form.studentId,
      groupId,
      facilitatorId,
      date: form.date,
      message: form.message.trim(),
    });
    setForm({ studentId: "", date: todayISO(), message: "" });
    setOpen(false);
  };

  const columns: Array<Column<Feedback>> = [
    { header: "Date", cell: (f) => formatDate(f.date) },
    {
      header: "Student",
      cell: (f) => (
        <StudentLink to={`/students/${f.studentId}`}>
          {db.students.find((s) => s.id === f.studentId)?.name ?? "—"}
        </StudentLink>
      ),
    },
    {
      header: "Group",
      cell: (f) => db.groups.find((g) => g.id === f.groupId)?.name ?? "—",
    },
    ...(isOrgWide || isGroupScoped
      ? [
          {
            header: "Facilitator",
            cell: (f: Feedback) =>
              db.facilitators.find((x) => x.id === f.facilitatorId)?.name ??
              "—",
          },
        ]
      : []),
    { header: "Feedback", cell: (f) => <MessageCell>{f.message}</MessageCell> },
  ];

  return (
    <>
      {isGroupScoped && (
        <BackLink
          to={`/groups/${paramGroup!.id}`}
          label={`Back to ${paramGroup!.name}`}
        />
      )}
      <PageHeader
        title="Feedback"
        subtitle={
          isGroupScoped
            ? paramGroup!.name
            : isOrgWide
              ? "Every facilitator's logged student feedback"
              : "What your students have shared"
        }
        action={
          canAdd && (
            <Button onClick={() => setOpen(true)}>+ Add feedback</Button>
          )
        }
      />

      <Card>
        <FilterRow>
          <Select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            options={[
              { value: "all", label: "All students" },
              ...eligibleStudents.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          {(isOrgWide || isGroupScoped) && (
            <Select
              value={facilitatorFilter}
              onChange={(e) => setFacilitatorFilter(e.target.value)}
              options={[
                { value: "all", label: "All facilitators" },
                ...db.facilitators.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          )}
        </FilterRow>

        <Table
          columns={columns}
          rows={items}
          rowKey={(f) => f.id}
          empty={
            <EmptyState
              icon="💬"
              title="No feedback yet"
              message="Feedback your students share will show up here."
            />
          }
        />
      </Card>

      <Modal
        open={open}
        title="Add feedback"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="feedback-form">
              Save feedback
            </Button>
          </>
        }
      >
        <Form id="feedback-form" onSubmit={submit}>
          <Select
            label="Student"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            options={[
              { value: "", label: "Choose a student..." },
              ...eligibleStudents.map((s) => ({ value: s.id, label: s.name })),
            ]}
            required
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Input
            textarea
            label="Feedback"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="What did the student share?"
            required
          />
        </Form>
      </Modal>
    </>
  );
}
