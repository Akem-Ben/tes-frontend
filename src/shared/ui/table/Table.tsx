import type { ReactNode } from "react";
import styled from "styled-components";
import { media } from "@/theme";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
}

const Scroller = styled.div`
  margin-left: -1rem;
  margin-right: -1rem;
  overflow-x: auto;

  ${media.sm} {
    margin-left: 0;
    margin-right: 0;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 520px;
  text-align: left;
  font-size: 0.875rem;
`;

const HeadRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Th = styled.th<{ $align: "left" | "right" | "center" }>`
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-align: ${({ $align }) => $align};
`;

const BodyRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.color.hover};
  }
`;

const Td = styled.td<{ $align: "left" | "right" | "center" }>`
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.color.textBody};
  text-align: ${({ $align }) => $align};
`;

export function Table<T>({ columns, rows, rowKey, empty }: TableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <Scroller>
      <StyledTable>
        <thead>
          <HeadRow>
            {columns.map((c) => (
              <Th
                key={c.header}
                $align={c.align ?? "left"}
                className={c.className}
              >
                {c.header}
              </Th>
            ))}
          </HeadRow>
        </thead>
        <tbody>
          {rows.map((row) => (
            <BodyRow key={rowKey(row)}>
              {columns.map((c) => (
                <Td
                  key={c.header}
                  $align={c.align ?? "left"}
                  className={c.className}
                >
                  {c.cell(row)}
                </Td>
              ))}
            </BodyRow>
          ))}
        </tbody>
      </StyledTable>
    </Scroller>
  );
}
