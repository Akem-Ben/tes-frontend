import { useState } from "react";
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
  Table,
  type Column,
} from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { BulkStudentForm } from "../components/BulkStudentForm";
import { useDb } from "@/shared/lib";
import {
  addStudents,
  createStudentsInPool,
  deleteStudent,
  toggleActive,
  updateStudent,
} from "../api";
import { addStudentToWaitingList } from "@/features/waiting-list/api";
import { useGroupParam } from "@/features/groups";
import { useConfirm } from "@/shared/hooks";
import type { NewStudent, Student } from "../api/types";
import { media } from "@/theme";

type Destination = "group" | "waitingList" | "unassigned";

const StudentLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FiltersGrid = styled.div`
  margin-bottom: 1rem;
  display: grid;
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: 1fr 180px;
  }
`;

const Hint = styled.p`
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const FieldStack = styled.div`
  > * + * {
    margin-top: 1rem;
  }
`;

const DestinationGrid = styled.div`
  margin-bottom: 1rem;

  > * + * {
    margin-top: 0.75rem;
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

const Checkbox = styled.input`
  height: 1rem;
  width: 1rem;
  accent-color: ${({ theme }) => theme.color.brand};
`;

export function StudentsPage() {
  const db = useDb();
  const { group } = useGroupParam();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [destination, setDestination] = useState<Destination>("group");
  const [waitingListId, setWaitingListId] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const confirm = useConfirm();

  if (!group) {
    return (
      <EmptyState
        icon="👥"
        title="Group not found"
        message="This group no longer exists."
        action={
          <Link to="/groups">
            <Button>Go to groups</Button>
          </Link>
        }
      />
    );
  }

  const openAdd = () => {
    setDestination("group");
    setWaitingListId(db.waitingLists[0]?.id ?? "");
    setAddOpen(true);
  };

  const handleAddRows = (rows: NewStudent[]) => {
    if (destination === "group") {
      addStudents(group.id, rows);
    } else {
      const created = createStudentsInPool(rows);
      if (destination === "waitingList" && waitingListId) {
        created.forEach((s) => addStudentToWaitingList(waitingListId, s.id));
      }
    }
    setAddOpen(false);
  };

  const students = db.students
    .filter((s) => s.groupIds.includes(group.id))
    .filter((s) =>
      status === "all" ? true : status === "active" ? s.isActive : !s.isActive,
    )
    .filter((s) => {
      const q = query.trim().toLowerCase();
      return (
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q)
      );
    });

  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelected((current) =>
      current.size === students.length
        ? new Set()
        : new Set(students.map((s) => s.id)),
    );

  const bulkDeactivate = (activate: boolean) => {
    selected.forEach((id) => {
      const student = db.students.find((s) => s.id === id);
      if (student && student.isActive !== activate) toggleActive(id);
    });
    setSelected(new Set());
  };

  const bulkDelete = () =>
    confirm.ask(
      `Delete ${selected.size} student${selected.size === 1 ? "" : "s"}?`,
      "Every record tied to these students (sign-ins, attendance, assignments, payments, feedback) will be permanently deleted. This cannot be undone.",
      () => {
        selected.forEach((id) => deleteStudent(id));
        setSelected(new Set());
      },
      "Delete",
    );

  const columns: Array<Column<Student>> = [
    {
      header: "",
      cell: (s) => (
        <Checkbox
          type="checkbox"
          checked={selected.has(s.id)}
          onChange={() => toggleSelected(s.id)}
        />
      ),
      className: "select",
    },
    {
      header: "Student",
      cell: (s) => <StudentLink to={`/students/${s.id}`}>{s.name}</StudentLink>,
    },
    { header: "Reg. number", cell: (s) => s.registrationNumber },
    {
      header: "Groups",
      cell: (s) =>
        s.groupIds
          .map((gid) => db.groups.find((g) => g.id === gid)?.name)
          .filter(Boolean)
          .join(", ") || "—",
    },
    { header: "Phone", cell: (s) => s.phone || "—" },
    {
      header: "Hour",
      cell: (s) =>
        s.hourOfPriesthood
          ? `${s.hourOfPriesthood}–${s.hourOfPriesthoodEnd}`
          : "—",
    },
    {
      header: "Status",
      cell: (s) => (
        <Badge tone={s.isActive ? "green" : "slate"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (s) => (
        <ActionsRow>
          <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              s.isActive
                ? confirm.ask(
                    "Deactivate student?",
                    `${s.name} will be excluded from new assignments, attendance and sign-in marking. Past records stay visible.`,
                    () => toggleActive(s.id),
                    "Deactivate",
                  )
                : toggleActive(s.id)
            }
          >
            {s.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              confirm.ask(
                "Delete student?",
                `${s.name} and every record tied to them (sign-ins, attendance, assignments, payments, feedback) will be permanently deleted. This cannot be undone.`,
                () => deleteStudent(s.id),
                "Delete",
              )
            }
          >
            Delete
          </Button>
        </ActionsRow>
      ),
    },
  ];

  return (
    <>
      <BackLink to={`/groups/${group.id}`} label={`Back to ${group.name}`} />
      <PageHeader
        title="Students"
        subtitle={group.name}
        action={<Button onClick={openAdd}>+ Add students</Button>}
      />

      {selected.size > 0 && (
        <BulkBar>
          <BulkText>{selected.size} selected</BulkText>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkDeactivate(false)}
          >
            Deactivate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkDeactivate(true)}
          >
            Activate
          </Button>
          <Button size="sm" variant="ghost" onClick={bulkDelete}>
            Delete
          </Button>
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
        <FiltersGrid>
          <Input
            placeholder="Search by name or reg. number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "all", label: "All students" },
              { value: "active", label: "Active only" },
              { value: "inactive", label: "Inactive only" },
            ]}
          />
        </FiltersGrid>
        {students.length > 0 && (
          <Button size="sm" variant="ghost" onClick={toggleSelectAll}>
            {selected.size === students.length
              ? "Clear selection"
              : "Select all"}
          </Button>
        )}
        <Table
          columns={columns}
          rows={students}
          rowKey={(s) => s.id}
          empty={
            <EmptyState
              icon="🎓"
              title="No students found"
              message="Add students to this group to begin tracking their progress."
              action={<Button onClick={openAdd}>Add students</Button>}
            />
          }
        />
      </Card>

      <Modal
        open={addOpen}
        title="Add students"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="bulk-student-form">
              Save students
            </Button>
          </>
        }
      >
        <DestinationGrid>
          <Select
            label="Add to"
            value={destination}
            onChange={(e) => setDestination(e.target.value as Destination)}
            options={[
              { value: "group", label: `This group (${group.name})` },
              { value: "waitingList", label: "Waiting list" },
              { value: "unassigned", label: "Unassigned (redundant)" },
            ]}
          />
          {destination === "waitingList" &&
            (db.waitingLists.length === 0 ? (
              <Hint>
                No waiting lists exist yet - ask an admin to create one first.
              </Hint>
            ) : (
              <Select
                label="Waiting list"
                value={waitingListId}
                onChange={(e) => setWaitingListId(e.target.value)}
                options={db.waitingLists.map((w) => ({
                  value: w.id,
                  label: w.name,
                }))}
              />
            ))}
        </DestinationGrid>
        <Hint>
          {destination === "group"
            ? `Registration numbers are generated automatically (e.g. TES-G${group.sequence}-0001).`
            : "Registration numbers for unassigned students use a separate pool sequence (e.g. TES-G0-0001)."}
        </Hint>
        <BulkStudentForm onSubmitRows={handleAddRows} />
      </Modal>

      <Modal
        open={editing !== null}
        title="Edit student"
        onClose={() => setEditing(null)}
        footer={
          <Button variant="secondary" onClick={() => setEditing(null)}>
            Done
          </Button>
        }
      >
        {editing && (
          <FieldStack>
            <Input
              label="Full name"
              value={editing.name}
              onChange={(e) => {
                updateStudent(editing.id, { name: e.target.value });
                setEditing({ ...editing, name: e.target.value });
              }}
            />
            <Input
              label="Phone"
              value={editing.phone}
              onChange={(e) => {
                updateStudent(editing.id, { phone: e.target.value });
                setEditing({ ...editing, phone: e.target.value });
              }}
            />
            <Input
              label="Priesthood hour starts"
              type="time"
              value={editing.hourOfPriesthood ?? ""}
              onChange={(e) => {
                updateStudent(editing.id, { hourOfPriesthood: e.target.value });
                setEditing({ ...editing, hourOfPriesthood: e.target.value });
              }}
            />
            <Input
              label="Ends"
              type="time"
              value={editing.hourOfPriesthoodEnd ?? ""}
              onChange={(e) => {
                updateStudent(editing.id, {
                  hourOfPriesthoodEnd: e.target.value,
                });
                setEditing({ ...editing, hourOfPriesthoodEnd: e.target.value });
              }}
            />
          </FieldStack>
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
