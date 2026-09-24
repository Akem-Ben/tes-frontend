import { useState, type FormEvent } from "react";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Table,
  type Column,
} from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { createFacilitator } from "../api";
import {
  facilitatorPerformance,
  type FacilitatorPerformance,
} from "@/features/analytics";
import type { TimeFilter } from "@/shared/lib";

const ExpandPanel = styled.div`
  margin-top: 1rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.75rem 1rem;
`;

const ExpandTitle = styled.p`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
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
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

export function FacilitatorsPage() {
  const db = useDb();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "password123",
  });
  const performance = facilitatorPerformance("monthly" as TimeFilter);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    createFacilitator(form);
    setForm({ name: "", email: "", phone: "", password: "password123" });
    setOpen(false);
  };

  const columns: Array<Column<FacilitatorPerformance>> = [
    {
      header: "Facilitator",
      cell: (f) => (
        <button
          type="button"
          onClick={() =>
            setExpanded(expanded === f.facilitatorId ? null : f.facilitatorId)
          }
        >
          {f.facilitatorName}
        </button>
      ),
    },
    { header: "Groups", cell: (f) => f.groupCount },
    { header: "Students", cell: (f) => f.studentCount },
    { header: "Avg. attendance", cell: (f) => `${f.averages.attendance}%` },
    { header: "Avg. submissions", cell: (f) => `${f.averages.submissions}%` },
  ];

  return (
    <>
      <PageHeader
        title="Facilitators"
        subtitle="Everyone with access to the portal"
        action={
          <Button onClick={() => setOpen(true)}>+ Add facilitator</Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          rows={performance}
          rowKey={(f) => f.facilitatorId}
          empty={
            <EmptyState
              icon="🧑‍🏫"
              title="No facilitators yet"
              message="Add your first facilitator to get started."
            />
          }
        />
        {expanded && (
          <ExpandPanel>
            <ExpandTitle>
              {db.facilitators.find((f) => f.id === expanded)?.name}'s groups
            </ExpandTitle>
            <GroupList>
              {db.groups
                .filter((g) => g.facilitatorIds.includes(expanded))
                .map((g) => (
                  <GroupRow key={g.id}>
                    <span>{g.name}</span>
                    <Badge tone="slate">
                      {
                        db.students.filter((s) => s.groupIds.includes(g.id))
                          .length
                      }{" "}
                      students
                    </Badge>
                  </GroupRow>
                ))}
              {db.groups.filter((g) => g.facilitatorIds.includes(expanded))
                .length === 0 && <GroupRow>No groups yet.</GroupRow>}
            </GroupList>
          </ExpandPanel>
        )}
      </Card>

      <Modal
        open={open}
        title="Add facilitator"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="facilitator-form">
              Add facilitator
            </Button>
          </>
        }
      >
        <Form id="facilitator-form" onSubmit={submit}>
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <Input
            label="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Form>
      </Modal>
    </>
  );
}
