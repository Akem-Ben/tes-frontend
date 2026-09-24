import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  Table,
  type Column,
} from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { createGroup } from "../api";
import type { Group } from "../api/types";

const GroupLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

/** Active-cohort groups first, matching how facilitators actually work day to day. */
const sortActiveFirst = (
  groups: Group[],
  db: ReturnType<typeof useDb>,
): Group[] =>
  [...groups].sort((a, b) => {
    const aActive =
      a.isActive &&
      db.cohorts.find((s) => s.id === a.cohortId)?.status === "active";
    const bActive =
      b.isActive &&
      db.cohorts.find((s) => s.id === b.cohortId)?.status === "active";
    if (aActive !== bActive) return aActive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

export function GroupsPage() {
  const db = useDb();
  const { role } = useAuth();
  const facilitatorId = useFacilitatorId();
  const isOrgWide =
    role === "president" || role === "admin" || role === "superadmin";
  const ownGroups = db.groups.filter((g) =>
    g.facilitatorIds.includes(facilitatorId),
  );
  const groups = sortActiveFirst(isOrgWide ? db.groups : ownGroups, db);
  const myCohorts = db.cohorts.filter((s) => s.facilitatorId === facilitatorId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cohortId, setCohortId] = useState("");

  const columns: Array<Column<Group>> = [
    {
      header: "Group",
      cell: (g) => <GroupLink to={`/groups/${g.id}`}>{g.name}</GroupLink>,
    },
    {
      header: "Cohort",
      cell: (g) => db.cohorts.find((s) => s.id === g.cohortId)?.name ?? "—",
    },
    {
      header: "Students",
      cell: (g) => db.students.filter((s) => s.groupIds.includes(g.id)).length,
    },
    { header: "Facilitators", cell: (g) => g.facilitatorIds.length },
    {
      header: "Status",
      cell: (g) => (
        <Badge tone={g.isActive ? "green" : "slate"}>
          {g.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const openCreate = () => {
    setName("");
    setCohortId(myCohorts[0]?.id ?? "");
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cohortId) return;
    createGroup(name.trim(), cohortId, [facilitatorId]);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Groups"
        subtitle={
          isOrgWide
            ? "Every group, across every facilitator"
            : "Every group belongs to one of your cohorts"
        }
        action={
          !isOrgWide &&
          myCohorts.length > 0 && (
            <Button onClick={openCreate}>+ Create group</Button>
          )
        }
      />
      <Card>
        <Table
          columns={columns}
          rows={groups}
          rowKey={(g) => g.id}
          empty={
            <EmptyState
              icon="👥"
              title="No groups yet"
              message={
                isOrgWide
                  ? "No facilitator has created a group yet."
                  : myCohorts.length === 0
                    ? "Create a cohort first, then create its group here."
                    : "Create your first group here, or open a cohort to create its group."
              }
              action={
                !isOrgWide &&
                (myCohorts.length === 0 ? (
                  <Link to="/cohorts">
                    <Button>Go to cohorts</Button>
                  </Link>
                ) : (
                  <Button onClick={openCreate}>Create group</Button>
                ))
              }
            />
          }
        />
      </Card>

      <Modal
        open={open}
        title="New group"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="group-form">
              Create group
            </Button>
          </>
        }
      >
        <Form id="group-form" onSubmit={submit}>
          <Input
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group 4 - Nazareth"
            required
          />
          <Select
            label="Cohort"
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            options={myCohorts.map((s) => ({ value: s.id, label: s.name }))}
            required
          />
        </Form>
      </Modal>
    </>
  );
}
