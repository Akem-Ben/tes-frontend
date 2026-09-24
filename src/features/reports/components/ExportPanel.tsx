import { useState } from "react";
import styled from "styled-components";
import { Card, Button, Select } from "@/shared/ui";
import { exportToExcel } from "@/shared/lib/excelExport";
import { addDays, todayISO } from "@/shared/lib/date";
import {
  assignmentSheet,
  attendanceSheet,
  feedbackSheet,
  paymentsSheet,
  signInOutSheet,
  weeklyClassSheet,
} from "../api";

type Period = "day" | "week" | "month";

const rangeFor = (period: Period): { from: string; to: string } => {
  const to = todayISO();
  const days = period === "day" ? 0 : period === "week" ? 7 : 30;
  return { from: addDays(to, -days), to };
};

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

const PeriodWrap = styled.div`
  width: 10rem;
`;

const ButtonRow = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

interface ExportPanelProps {
  /** Omit to export across every facilitator (president/admin scope). */
  facilitatorId?: string | undefined;
  /** Restrict to one group. */
  groupId?: string | undefined;
  /** Restrict to one cohort - the intake batch students are placed into before a group. */
  cohortId?: string | undefined;
}

export function ExportPanel({
  facilitatorId,
  groupId,
  cohortId,
}: ExportPanelProps) {
  const [period, setPeriod] = useState<Period>("week");

  const scope = { facilitatorId, groupId, cohortId, ...rangeFor(period) };
  const stamp = `${scope.from}_to_${scope.to}`;

  return (
    <Card title="Export to Excel" subtitle="Download activity as a spreadsheet">
      <Row>
        <PeriodWrap>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            options={[
              { value: "day", label: "Today" },
              { value: "week", label: "This week" },
              { value: "month", label: "This month" },
            ]}
          />
        </PeriodWrap>
      </Row>

      <ButtonRow>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportToExcel([signInOutSheet(scope)], `signinout_${stamp}`)
          }
        >
          Sign in / out
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportToExcel([attendanceSheet(scope)], `attendance_${stamp}`)
          }
        >
          Attendance
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportToExcel([assignmentSheet(scope)], `assignments_${stamp}`)
          }
        >
          Assignments
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportToExcel([weeklyClassSheet(scope)], `weekly_classes_${stamp}`)
          }
        >
          Weekly classes
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportToExcel([feedbackSheet(scope)], `feedback_${stamp}`)
          }
        >
          Feedback
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportToExcel([paymentsSheet(scope)], `payments_${stamp}`)
          }
        >
          Payments
        </Button>
        <Button
          size="sm"
          onClick={() =>
            exportToExcel(
              [
                signInOutSheet(scope),
                attendanceSheet(scope),
                weeklyClassSheet(scope),
                assignmentSheet(scope),
                feedbackSheet(scope),
                paymentsSheet(scope),
              ],
              `tes_report_${stamp}`,
            )
          }
        >
          Export everything
        </Button>
      </ButtonRow>
    </Card>
  );
}
