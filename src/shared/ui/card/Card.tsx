import type { ReactNode } from "react";
import styled from "styled-components";
import { media } from "@/theme";

interface CardProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  action?: ReactNode;
  className?: string | undefined;
  children?: ReactNode;
}

const Section = styled.section`
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.card};
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};

  ${media.sm} {
    padding: 1.25rem;
  }
`;

const Header = styled.header`
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
`;

const Subtitle = styled.p`
  margin-top: 0.125rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function Card({
  title,
  subtitle,
  action,
  className,
  children,
}: CardProps) {
  return (
    <Section className={className}>
      {(title || action) && (
        <Header>
          <div>
            {title && <Title>{title}</Title>}
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </div>
          {action}
        </Header>
      )}
      {children}
    </Section>
  );
}
