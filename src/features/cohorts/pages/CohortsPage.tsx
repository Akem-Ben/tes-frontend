import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Table,
  type Column,
  Modal,
  ConfirmModal,
  Input,
} from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { createCohort, deleteCohort, setCohortStatus } from "../api";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { useConfirm } from "@/shared/hooks";
import { formatDate, todayISO } from "@/shared/lib";
import type { Cohort } from "../api/types";
import { media } from "@/theme";

const CohortLink = styled(Link)`
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

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const DateGrid = styled.div`
  display: grid;
  gap: 1rem;

  ${media.sm} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export function CohortsPage() {
  const db = useDb();
  const { role } = useAuth();
  const facilitatorId = useFacilitatorId();
  const isOrgWide =
    role === "president" || role === "admin" || role === "superadmin";
  const canCreate =
    role === "facilitator" || role === "admin" || role === "superadmin";
  const cohorts = isOrgWide
    ? db.cohorts
    : db.cohorts.filter((s) => s.facilitatorId === facilitatorId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: todayISO(),
    endDate: todayISO(),
  });
  const confirm = useConfirm();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    createCohort({
      ...form,
      facilitatorId: role === "facilitator" ? facilitatorId : undefined,
      status: "active",
      studentIds: [],
    });
    setForm({ name: "", startDate: todayISO(), endDate: todayISO() });
    setOpen(false);
  };

  const columns: Array<Column<Cohort>> = [
    {
      header: "Cohort",
      cell: (s) => <CohortLink to={`/cohorts/${s.id}`}>{s.name}</CohortLink>,
    },
    ...(isOrgWide
      ? [
          {
            header: "Groups",
            cell: (s: Cohort) =>
              db.groups.filter((g) => g.cohortId === s.id).length,
          },
        ]
      : []),
    { header: "Starts", cell: (s) => formatDate(s.startDate) },
    { header: "Ends", cell: (s) => formatDate(s.endDate) },
    { header: "Pool", cell: (s) => s.studentIds.length },
    {
      header: "Status",
      cell: (s) => (
        <Badge tone={s.status === "active" ? "green" : "slate"}>
          {s.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (s) => (
        <ActionsRow>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setCohortStatus(s.id, s.status === "active" ? "closed" : "active")
            }
          >
            {s.status === "active" ? "Close" : "Reopen"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              confirm.ask(
                "Delete cohort?",
                `"${s.name}" will be removed. Groups linked to it stay but become unlinked.`,
                () => deleteCohort(s.id),
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
      <PageHeader
        title="Cohorts"
        subtitle={
          isOrgWide
            ? "Every cohort, across every facilitator"
            : "Each cohort holds one or more groups"
        }
        action={
          canCreate && (
            <Button onClick={() => setOpen(true)}>+ New cohort</Button>
          )
        }
      />

      <Card>
        <Table
          columns={columns}
          rows={cohorts}
          rowKey={(s) => s.id}
          empty={
            <EmptyState
              icon="📅"
              title="No cohorts yet"
              message="Create your first cohort to start adding a group and students."
              action={
                canCreate && (
                  <Button onClick={() => setOpen(true)}>Create cohort</Button>
                )
              }
            />
          }
        />
      </Card>

      <Modal
        open={open}
        title="New cohort"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="cohort-form">
              Create cohort
            </Button>
          </>
        }
      >
        <Form id="cohort-form" onSubmit={submit}>
          <Input
            label="Cohort name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="2026 First Cohort"
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
