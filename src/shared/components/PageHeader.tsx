import type { ReactNode } from "react";
import styled from "styled-components";
import { media } from "@/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode;
}

const Wrapper = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};

  ${media.sm} {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Wrapper>
      <div>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {action}
    </Wrapper>
  );
}
