import type { ReactNode } from "react";
import styled from "styled-components";

type Tone = "brand" | "green" | "red" | "amber" | "slate";

const StyledBadge = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radius.full};
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  white-space: nowrap;
  background-color: ${({ theme, $tone }) => theme.tone[$tone].bg};
  color: ${({ theme, $tone }) => theme.tone[$tone].fg};
`;

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <StyledBadge $tone={tone}>{children}</StyledBadge>;
}
