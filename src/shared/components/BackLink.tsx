import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const StyledLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.textMuted};

  &:hover {
    color: ${({ theme }) => theme.color.brand};
  }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.textMuted};

  &:hover {
    color: ${({ theme }) => theme.color.brand};
  }
`;

interface BackLinkProps {
  /** A fixed destination. Omit to fall back to the browser's previous page. */
  to?: string | undefined;
  label: string;
}

/** A consistent "← Back to X" affordance, placed above a page's header. */
export function BackLink({ to, label }: BackLinkProps) {
  const navigate = useNavigate();
  if (!to) {
    return (
      <StyledButton type="button" onClick={() => navigate(-1)}>
        <span aria-hidden>←</span> {label}
      </StyledButton>
    );
  }
  return (
    <StyledLink to={to}>
      <span aria-hidden>←</span> {label}
    </StyledLink>
  );
}
