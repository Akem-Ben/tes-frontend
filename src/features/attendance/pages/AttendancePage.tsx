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
import { createEvent, deleteEvent } from "../api";
import { useGroupParam } from "@/features/groups";
import { useConfirm } from "@/shared/hooks";
import { formatDateTime, isPast, todayISO } from "@/shared/lib";
import type { Recurrence } from "../api/types";

const FilterRow = styled.div`
  margin-bottom: 1rem;
  max-width: 20rem;
`;

const EventList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const EventItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const EventLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const EventMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const EventActions = styled.div`
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

export function AttendancePage() {
  const db = useDb();
  const { group } = useGroupParam();
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    type: "Prayer Meeting",
    date: `${todayISO()}T18:00`,
    recurrence: "none" as Recurrence,
  });
  const confirm = useConfirm();

  if (!group) {
    return (
      <EmptyState
        icon="✅"
        title="Group not found"
        message="This group no longer exists."
      />
    );
  }

  const events = db.attendanceEvents
    .filter((e) => e.groupId === group.id)
    .filter((e) => typeFilter === "all" || e.type === typeFilter)
    .sort((a, b) => b.date.localeCompare(a.date));
  const types = Array.from(
    new Set(
      db.attendanceEvents
        .filter((e) => e.groupId === group.id)
        .map((e) => e.type),
    ),
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const activeIds = db.students
      .filter((s) => s.groupIds.includes(group.id) && s.isActive)
      .map((s) => s.id);
    createEvent({ ...form, groupId: group.id, studentIds: activeIds });
    setOpen(false);
  };

  return (
    <>
      <BackLink to={`/groups/${group.id}`} label={`Back to ${group.name}`} />
      <PageHeader
        title="Attendance"
        subtitle={`${group.name} · Prayer meetings, classes and any other gathering`}
        action={<Button onClick={() => setOpen(true)}>+ New event</Button>}
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

        {events.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No attendance events"
            message="Create an event, add your students and mark who attended."
            action={<Button onClick={() => setOpen(true)}>Create event</Button>}
          />
        ) : (
          <EventList>
            {events.map((e) => {
              const marked = db.attendanceRecords.filter(
                (r) => r.attendanceEventId === e.id,
              ).length;
              const upcoming = !isPast(e.date);
              return (
                <EventItem key={e.id}>
                  <div>
                    <EventLink to={`/groups/${group.id}/attendance/${e.id}`}>
                      {e.name}
                    </EventLink>
                    <EventMeta>
                      {formatDateTime(e.date)} · {e.studentIds.length} students
                      · {marked} marked
                    </EventMeta>
                  </div>
                  <EventActions>
                    <Badge tone="brand">{e.type}</Badge>
                    <Badge tone={upcoming ? "amber" : "slate"}>
                      {upcoming ? "Upcoming" : "Past"}
                    </Badge>
                    {e.recurrence !== "none" && (
                      <Badge tone="slate">weekly</Badge>
                    )}
                    {e.finishedAt && <Badge tone="green">Finished</Badge>}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        confirm.ask(
                          "Delete event?",
                          `"${e.name}" and all its attendance records will be deleted.`,
                          () => deleteEvent(e.id),
                          "Delete",
                        )
                      }
                    >
                      Delete
                    </Button>
                  </EventActions>
                </EventItem>
              );
            })}
          </EventList>
        )}
      </Card>

      <Modal
        open={open}
        title="New attendance event"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="event-form">
              Create event
            </Button>
          </>
        }
      >
        <StyledForm id="event-form" onSubmit={submit}>
          <Input
            label="Event name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Wednesday Prayer Meeting"
            required
          />
          <Input
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            hint="Any label: Prayer Meeting, Class, Retreat..."
            required
          />
          <Input
            label="Date & time"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
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
          <HelpText>
            All active students are added automatically. You can change the list
            on the event page.
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
