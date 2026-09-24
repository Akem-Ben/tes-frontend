import styled, { css } from "styled-components";

interface MarkToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  disabled?: boolean;
}

const Group = styled.div`
  display: inline-flex;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.borderStrong};
`;

const base = css`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:disabled {
    opacity: 0.4;
  }
`;

const YesButton = styled.button<{ $active: boolean }>`
  ${base}
  background-color: ${({ theme, $active }) => ($active ? "#059669" : theme.color.card)};
  color: ${({ theme, $active }) => ($active ? "#ffffff" : theme.color.textMuted)};

  &:hover:not(:disabled) {
    background-color: ${({ theme, $active }) =>
      $active
        ? "#059669"
        : theme.name === "dark"
          ? theme.color.mutedStrong
          : "#ecfdf5"};
  }
`;

const NoButton = styled(YesButton)`
  border-left: 1px solid ${({ theme }) => theme.color.borderStrong};
  background-color: ${({ theme, $active }) => ($active ? "#e11d48" : theme.color.card)};
  color: ${({ theme, $active }) => ($active ? "#ffffff" : theme.color.textMuted)};

  &:hover:not(:disabled) {
    background-color: ${({ theme, $active }) =>
      $active
        ? "#e11d48"
        : theme.name === "dark"
          ? theme.color.mutedStrong
          : "#fff1f2"};
  }
`;

/** Fast two-button toggle used for attendance, submissions and sign in/out. */
export function MarkToggle({
  value,
  onChange,
  yesLabel = "Present",
  noLabel = "Absent",
  disabled = false,
}: MarkToggleProps) {
  return (
    <Group>
      <YesButton
        type="button"
        disabled={disabled}
        $active={value === true}
        onClick={() => onChange(true)}
      >
        {yesLabel}
      </YesButton>
      <NoButton
        type="button"
        disabled={disabled}
        $active={value === false}
        onClick={() => onChange(false)}
      >
        {noLabel}
      </NoButton>
    </Group>
  );
}
