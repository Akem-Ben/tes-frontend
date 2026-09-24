import styled from "styled-components";

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

const Bar = styled.div`
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.25rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  background-color: ${({ theme, $active }) => ($active ? theme.color.panel : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.color.brand : theme.color.textMuted)};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadow.sm : "none")};

  &:hover {
    color: ${({ theme, $active }) => ($active ? theme.color.brand : theme.color.text)};
  }
`;

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <Bar>
      {tabs.map((t) => (
        <TabButton
          key={t.id}
          $active={active === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </TabButton>
      ))}
    </Bar>
  );
}
