import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  Button,
  Badge,
  Modal,
  Select,
  Table,
  type Column,
} from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useDb, listRedundantStudents } from "@/shared/lib";
import { useAuth } from "@/features/auth";
import { addStudentToWaitingList } from "@/features/waiting-list/api";
import type { Student } from "@/shared/lib/mockStore";

const StudentLink = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const SelectWrap = styled.div`
  margin-top: 0.75rem;
`;

export function RedundantStudentsPage() {
  const db = useDb();
  const { role } = useAuth();
  const [targeting, setTargeting] = useState<Student | null>(null);
  const [waitingListId, setWaitingListId] = useState("");
  const canManage = role === "facilitator" || role === "admin";

  const students = listRedundantStudents();

  const columns: Array<Column<Student>> = [
    {
      header: "Student",
      cell: (s) => <StudentLink to={`/students/${s.id}`}>{s.name}</StudentLink>,
    },
    { header: "Reg. number", cell: (s) => s.registrationNumber },
    { header: "Phone", cell: (s) => s.phone || "—" },
    { header: "Joined", cell: (s) => s.dateJoined },
    {
      header: "Status",
      cell: (s) => (
        <Badge tone={s.isActive ? "green" : "slate"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            cell: (s: Student) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setTargeting(s);
                  setWaitingListId(db.waitingLists[0]?.id ?? "");
                }}
              >
                + Waiting list
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Redundant Students"
        subtitle="Not in a group, waiting list, or cohort"
      />

      <Card>
        <Table
          columns={columns}
          rows={students}
          rowKey={(s) => s.id}
          empty={
            <EmptyState
              icon="🎓"
              title="No redundant students"
              message="Every student is either in a group, a waiting list, or a cohort."
            />
          }
        />
      </Card>

      <Modal
        open={targeting !== null}
        title={targeting ? `Add ${targeting.name} to a waiting list` : ""}
        onClose={() => setTargeting(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTargeting(null)}>
              Cancel
            </Button>
            <Button
              disabled={!waitingListId}
              onClick={() => {
                if (targeting && waitingListId)
                  addStudentToWaitingList(waitingListId, targeting.id);
                setTargeting(null);
              }}
            >
              Add
            </Button>
          </>
        }
      >
        {db.waitingLists.length === 0 ? (
          <EmptyState
            icon="🕒"
            title="No waiting lists yet"
            message="Ask an admin to create one first."
          />
        ) : (
          <SelectWrap>
            <Select
              label="Waiting list"
              value={waitingListId}
              onChange={(e) => setWaitingListId(e.target.value)}
              options={db.waitingLists.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
            />
          </SelectWrap>
        )}
      </Modal>
    </>
  );
}
