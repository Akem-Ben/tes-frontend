import { Link } from "react-router-dom";
import styled from "styled-components";
import { media } from "@/theme";

const roles = [
  { label: "Admin", to: "/login/admin", icon: "🛠️" },
  { label: "President", to: "/login/president", icon: "🎖️" },
  { label: "Facilitator", to: "/login/facilitator", icon: "🎓" },
];

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 0.75rem;
  backdrop-filter: blur(8px);

  ${media.sm} {
    left: auto;
    right: 1.25rem;
    bottom: auto;
    top: 50%;
    transform: translateY(-50%);
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 1rem;
    padding: 0.5rem;
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

const Inner = styled.div`
  margin: 0 auto;
  display: flex;
  max-width: 28rem;
  gap: 0.5rem;

  ${media.sm} {
    flex-direction: column;
  }
`;

const RoleLink = styled(Link)`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.brand};
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.onBrand};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.brandDark};
  }

  ${media.sm} {
    justify-content: flex-start;
  }
`;

/** Always visible while scrolling: bottom bar on mobile, right rail on desktop. */
export function StickyRoleButtons() {
  return (
    <Bar>
      <Inner>
        {roles.map((r) => (
          <RoleLink key={r.label} to={r.to}>
            <span aria-hidden>{r.icon}</span>
            {r.label}
          </RoleLink>
        ))}
      </Inner>
    </Bar>
  );
}
