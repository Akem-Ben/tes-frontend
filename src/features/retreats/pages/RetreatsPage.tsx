import { useState, type FormEvent } from "react";
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
import {
  createRetreat,
  deleteRetreat,
  finishRetreat,
  markRetreatAttendance,
} from "../api";
import { useGroupParam } from "@/features/groups";
import { useConfirm } from "@/shared/hooks";
import { formatDate, todayISO } from "@/shared/lib";

const RetreatList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const RetreatItem = styled.li`
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const RetreatHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const RetreatName = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const RetreatMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const RetreatActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const DateGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StudentList = styled.ul`
  margin-top: 0.75rem;

  > * + * {
    margin-top: 0.5rem;
  }
`;

const StudentRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.5rem 0.75rem;
`;

const StudentName = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.text};
`;

const statusOf = (r: { startDate: string; endDate: string }) => {
  const today = todayISO();
  if (today < r.startDate) return { label: "Upcoming", tone: "amber" as const };
  if (today > r.endDate) return { label: "Past", tone: "slate" as const };
  return { label: "Ongoing", tone: "green" as const };
};

export function RetreatsPage() {
  const db = useDb();
  const { group } = useGroupParam();
  const [open, setOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    startDate: todayISO(),
    endDate: todayISO(),
    description: "",
  });
  const confirm = useConfirm();

  if (!group) {
    return (
      <EmptyState
        icon="⛺"
        title="Group not found"
        message="This group no longer exists."
      />
    );
  }

  const retreats = db.retreats
    .filter((r) => r.groupId === group.id)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const marking = markingId ? retreats.find((r) => r.id === markingId) : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const activeIds = db.students
      .filter((s) => s.groupIds.includes(group.id) && s.isActive)
      .map((s) => s.id);
    createRetreat({ ...form, groupId: group.id, studentIds: activeIds });
    setForm({
      name: "",
      startDate: todayISO(),
      endDate: todayISO(),
      description: "",
    });
    setOpen(false);
  };

  return (
    <>
      <BackLink to={`/groups/${group.id}`} label={`Back to ${group.name}`} />
      <PageHeader
        title="Retreats"
        subtitle={`${group.name} · Multi-day retreat events and attendance`}
        action={<Button onClick={() => setOpen(true)}>+ New retreat</Button>}
      />

      <Card>
        {retreats.length === 0 ? (
          <EmptyState
            icon="⛺"
            title="No retreats yet"
            message="Create a retreat and mark who attended."
            action={
              <Button onClick={() => setOpen(true)}>Create retreat</Button>
            }
          />
        ) : (
          <RetreatList>
            {retreats.map((r) => {
              const status = statusOf(r);
              const attended = db.retreatAttendance.filter(
                (a) => a.retreatId === r.id && a.attended,
              ).length;
              return (
                <RetreatItem key={r.id}>
                  <RetreatHeader>
                    <div>
                      <RetreatName>{r.name}</RetreatName>
                      <RetreatMeta>
                        {formatDate(r.startDate)} → {formatDate(r.endDate)} ·{" "}
                        {r.studentIds.length} students · {attended} attended
                      </RetreatMeta>
                    </div>
                    <RetreatActions>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {r.finishedAt && <Badge tone="green">Finished</Badge>}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMarkingId(r.id)}
                      >
                        Mark attendance
                      </Button>
                      {!r.finishedAt && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            confirm.ask(
                              "Mark this retreat finished?",
                              `"${r.name}" can no longer be edited once finished.`,
                              () => finishRetreat(r.id),
                              "Finish",
                            )
                          }
                        >
                          Finish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          confirm.ask(
                            "Delete retreat?",
                            `"${r.name}" and its attendance will be deleted.`,
                            () => deleteRetreat(r.id),
                            "Delete",
                          )
                        }
                      >
                        Delete
                      </Button>
                    </RetreatActions>
                  </RetreatHeader>
                </RetreatItem>
              );
            })}
          </RetreatList>
        )}
      </Card>

      <Modal
        open={open}
        title="New retreat"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="retreat-form">
              Create retreat
            </Button>
          </>
        }
      >
        <Form id="retreat-form" onSubmit={submit}>
          <Input
            label="Retreat name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Foundations Retreat"
            required
          />
          <DateGrid>
            <Input
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="End date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </DateGrid>
          <Input
            textarea
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Form>
      </Modal>

      <Modal
        open={marking !== null}
        title={marking ? `Mark attendance — ${marking.name}` : ""}
        onClose={() => setMarkingId(null)}
        footer={
          <Button variant="secondary" onClick={() => setMarkingId(null)}>
            Done
          </Button>
        }
      >
        {marking && (
          <StudentList>
            {db.students
              .filter((s) => marking.studentIds.includes(s.id))
              .map((s) => {
                const record = db.retreatAttendance.find(
                  (a) => a.retreatId === marking.id && a.studentId === s.id,
                );
                return (
                  <StudentRow key={s.id}>
                    <StudentName>{s.name}</StudentName>
                    <MarkToggle
                      value={record ? record.attended : null}
                      disabled={Boolean(marking.finishedAt)}
                      onChange={(v) =>
                        markRetreatAttendance(marking.id, s.id, v)
                      }
                    />
                  </StudentRow>
                );
              })}
          </StudentList>
        )}
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
