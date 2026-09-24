import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Button, Input } from "@/shared/ui";
import type { NewStudent } from "../api/types";
import { media } from "@/theme";

const emptyRow: NewStudent = {
  name: "",
  phone: "",
  hourOfPriesthood: "",
  hourOfPriesthoodEnd: "",
};

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const RowBox = styled.div`
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const RowHeader = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RowLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
`;

const RemoveButton = styled.button`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.danger};
`;

const RowGrid = styled.div`
  display: grid;
  gap: 0.75rem;

  ${media.sm} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

/** Repeatable rows so a facilitator can add many students at once, no reloads. */
export function BulkStudentForm({
  onSubmitRows,
}: {
  onSubmitRows: (rows: NewStudent[]) => void;
}) {
  const [rows, setRows] = useState<NewStudent[]>([{ ...emptyRow }]);

  const update = (index: number, patch: Partial<NewStudent>) =>
    setRows((current) =>
      current.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.name.trim() !== "");
    if (valid.length === 0) return;
    onSubmitRows(valid);
    setRows([{ ...emptyRow }]);
  };

  return (
    <Form id="bulk-student-form" onSubmit={submit}>
      {rows.map((row, i) => (
        <RowBox key={i}>
          <RowHeader>
            <RowLabel>Student {i + 1}</RowLabel>
            {rows.length > 1 && (
              <RemoveButton
                type="button"
                onClick={() => setRows((c) => c.filter((_, j) => j !== i))}
              >
                Remove
              </RemoveButton>
            )}
          </RowHeader>
          <RowGrid>
            <Input
              label="Full name"
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Grace Adeyemi"
              required={i === 0}
            />
            <Input
              label="Phone"
              value={row.phone}
              onChange={(e) => update(i, { phone: e.target.value })}
              placeholder="0803..."
            />
            <Input
              label="Priesthood hour starts"
              type="time"
              value={row.hourOfPriesthood ?? ""}
              onChange={(e) => update(i, { hourOfPriesthood: e.target.value })}
              hint="Optional, editable later"
            />
            <Input
              label="Ends"
              type="time"
              value={row.hourOfPriesthoodEnd ?? ""}
              onChange={(e) =>
                update(i, { hourOfPriesthoodEnd: e.target.value })
              }
              hint="Defaults to +1 hour"
            />
          </RowGrid>
        </RowBox>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => setRows((c) => [...c, { ...emptyRow }])}
      >
        + Add another row
      </Button>
    </Form>
  );
}
