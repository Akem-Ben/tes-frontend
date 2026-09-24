import { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, Select, Table, type Column, Input, Button } from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import { useDb, currentWeekKey } from "@/shared/lib";
import {
  ensureCurrentPeriodPayments,
  paymentSummary,
  setPayment,
} from "../api";
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";
import type { Payment } from "../api/types";
import { media } from "@/theme";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  ${media.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
`;

const StatValue = styled.p`
  margin-top: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const FilterRow = styled.div`
  margin-bottom: 1rem;
  display: grid;
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: 1fr 1fr;
    max-width: 32rem;
  }
`;

const AmountCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AmountInput = styled(Input)`
  width: 6rem;
`;

export function PaymentsPage() {
  const db = useDb();
  const period = currentWeekKey();
  const [groupId, setGroupId] = useState("all");

  useEffect(() => {
    ensureCurrentPeriodPayments();
  }, []);

  const payments = db.payments.filter(
    (p) => p.period === period && (groupId === "all" || p.groupId === groupId),
  );
  const summary = paymentSummary(payments);

  const columns: Array<Column<Payment>> = [
    {
      header: "Student",
      cell: (p) => db.students.find((s) => s.id === p.studentId)?.name ?? "—",
    },
    {
      header: "Group",
      cell: (p) => db.groups.find((g) => g.id === p.groupId)?.name ?? "—",
    },
    { header: "Due", cell: (p) => `₦${p.amountDue.toLocaleString()}` },
    {
      header: "Paid",
      cell: (p) => (
        <AmountCell>
          <AmountInput
            type="number"
            min={0}
            max={p.amountDue}
            defaultValue={p.amountPaid}
            onBlur={(e) => setPayment(p.id, Number(e.target.value))}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPayment(p.id, p.amountDue)}
          >
            Mark paid
          </Button>
        </AmountCell>
      ),
    },
    { header: "Status", cell: (p) => <PaymentStatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader title="Payments" subtitle={`This period: ${period}`} />

      <StatsGrid>
        <Card>
          <StatLabel>Paid</StatLabel>
          <StatValue>{summary.paid}</StatValue>
        </Card>
        <Card>
          <StatLabel>Partial</StatLabel>
          <StatValue>{summary.partial}</StatValue>
        </Card>
        <Card>
          <StatLabel>Unpaid</StatLabel>
          <StatValue>{summary.unpaid}</StatValue>
        </Card>
        <Card>
          <StatLabel>Collected</StatLabel>
          <StatValue>
            ₦{summary.totalCollected.toLocaleString()} / ₦
            {summary.totalDue.toLocaleString()}
          </StatValue>
        </Card>
      </StatsGrid>

      <Card>
        <FilterRow>
          <Select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            options={[
              { value: "all", label: "All groups" },
              ...db.groups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
        </FilterRow>
        <Table columns={columns} rows={payments} rowKey={(p) => p.id} />
      </Card>
    </>
  );
}
