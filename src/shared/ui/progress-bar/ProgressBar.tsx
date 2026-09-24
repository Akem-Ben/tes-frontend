import styled from "styled-components";

interface ProgressBarProps {
  label?: string | undefined;
  value: number; // 0 - 100
  caption?: string | undefined;
}

const Meta = styled.div`
  margin-bottom: 0.25rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.875rem;
`;

const Label = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.color.textBody};
`;

const Caption = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
`;

const Track = styled.div`
  height: 0.5rem;
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme }) => theme.color.mutedStrong};
`;

const Fill = styled.div<{ $value: number; $tone: "green" | "amber" | "red" }>`
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.full};
  width: ${({ $value }) => `${Math.min($value, 100)}%`};
  background-color: ${({ theme, $tone }) => theme.bar[$tone]};
  transition: width 0.3s ease;
`;

export function ProgressBar({ label, value, caption }: ProgressBarProps) {
  const tone = value >= 75 ? "green" : value >= 50 ? "amber" : "red";
  return (
    <div>
      {(label || caption) && (
        <Meta>
          <Label>{label}</Label>
          <Caption>{caption ?? `${value}%`}</Caption>
        </Meta>
      )}
      <Track>
        <Fill $value={value} $tone={tone} />
      </Track>
    </div>
  );
}
