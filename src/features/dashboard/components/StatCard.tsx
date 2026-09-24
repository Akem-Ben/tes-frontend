import styled from "styled-components";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  hint?: string | undefined;
}

const Box = styled.div`
  min-width: 0;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.card};
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Value = styled.p`
  margin-top: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: clamp(1rem, 1.4vw + 0.7rem, 1.5rem);
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const Hint = styled.p`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <Box>
      <Row>
        <Label>{label}</Label>
        <span aria-hidden>{icon}</span>
      </Row>
      <Value title={String(value)}>{value}</Value>
      {hint && <Hint>{hint}</Hint>}
    </Box>
  );
}
