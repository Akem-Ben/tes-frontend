import type { ReactNode } from "react";
import styled from "styled-components";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: ReactNode;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px dashed ${({ theme }) => theme.color.borderStrong};
  padding: 2.5rem 1.5rem;
  text-align: center;
`;

const Icon = styled.span`
  font-size: 1.875rem;
  line-height: 2.25rem;
`;

const Title = styled.h3`
  margin-top: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
`;

const Message = styled.p`
  margin-top: 0.25rem;
  max-width: 24rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Action = styled.div`
  margin-top: 1rem;
`;

export function EmptyState({
  icon = "📋",
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <Wrapper>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      <Message>{message}</Message>
      {action && <Action>{action}</Action>}
    </Wrapper>
  );
}
