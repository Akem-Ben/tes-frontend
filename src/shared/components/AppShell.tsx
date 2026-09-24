import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "@/features/auth";
import { ThemeToggle } from "./ThemeToggle";
import { initials } from "@/shared/lib/format";
import { media } from "@/theme";
import type { Role } from "@/features/auth/api/types";
import logo from "@/assets/pistis-logo.jpg";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  /** Kept on the desktop sidebar but dropped from the mobile bottom nav (limited space). */
  mobileHidden?: boolean;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  // Students, sign-in/out, attendance, classes, assignments, retreats, feedback and
  // analytics are all reached by opening a group first - see GroupDetailPage's tools.
  // Reports stands on its own: it isn't tied to any single group.
  facilitator: [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/cohorts", label: "Cohorts", icon: "📅" },
    { to: "/groups", label: "Groups", icon: "👥" },
    { to: "/reports", label: "Reports", icon: "📤" },
    { to: "/waiting-list", label: "Waiting List", icon: "🕒" },
    {
      to: "/redundant-students",
      label: "Redundant Students",
      icon: "📇",
      mobileHidden: true,
    },
    { to: "/chat", label: "Chat", icon: "💭" },
  ],
  president: [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/facilitators", label: "Facilitators", icon: "🧑‍🏫" },
    { to: "/cohorts", label: "Cohorts", icon: "📅" },
    { to: "/groups", label: "Groups", icon: "👥" },
    { to: "/reports", label: "Reports", icon: "📤" },
    { to: "/waiting-list", label: "Waiting List", icon: "🕒" },
    {
      to: "/redundant-students",
      label: "Redundant Students",
      icon: "📇",
      mobileHidden: true,
    },
    { to: "/feedback", label: "Feedback", icon: "💬" },
    { to: "/analytics", label: "Analytics", icon: "📊" },
  ],
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/facilitators", label: "Facilitators", icon: "🧑‍🏫" },
    { to: "/cohorts", label: "Cohorts", icon: "📅" },
    { to: "/groups", label: "Groups", icon: "👥" },
    { to: "/reports", label: "Reports", icon: "📤" },
    { to: "/waiting-list", label: "Waiting List", icon: "🕒" },
    {
      to: "/redundant-students",
      label: "Redundant Students",
      icon: "📇",
      mobileHidden: true,
    },
    { to: "/payments", label: "Payments", icon: "💳" },
    { to: "/feedback", label: "Feedback", icon: "💬" },
    { to: "/analytics", label: "Analytics", icon: "📊" },
  ],
};

const BOTTOM_NAV_SLICE = 5;

const Root = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.color.bg};
`;

const Sidebar = styled.aside`
  display: none;

  ${media.lg} {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    width: 16rem;
    flex-direction: column;
    border-right: 1px solid ${({ theme }) => theme.color.border};
    background-color: ${({ theme }) => theme.color.panel};
    padding: 1rem;
  }
`;

const BrandLink = styled(Link)`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const BrandLogo = styled.img`
  height: 2.5rem;
  width: 2.5rem;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.full};
  object-fit: cover;
`;

const BrandName = styled.p`
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25;
  color: ${({ theme }) => theme.color.text};
`;

const BrandSub = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.brand};
`;

const SideNav = styled.nav`
  flex: 1;
  overflow-y: auto;

  > * + * {
    margin-top: 0.25rem;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  background-color: ${({ theme, $active }) => ($active ? theme.color.brand : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.color.onBrand : theme.color.textMuted)};

  &:hover {
    background-color: ${({ theme, $active }) => ($active ? theme.color.brand : theme.color.muted)};
  }
`;

const NavLabel = styled.span`
  flex: 1;
`;

const SignOutButton = styled.button`
  margin-top: 1rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.danger};

  &:hover {
    background-color: ${({ theme }) => theme.color.dangerSoft};
  }
`;

const Content = styled.div`
  ${media.lg} {
    padding-left: 16rem;
  }
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 0.75rem 1rem;
  backdrop-filter: blur(8px);
`;

const MenuButton = styled.button`
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0.25rem 0.5rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.color.textMuted};

  ${media.lg} {
    display: none;
  }
`;

const TopbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MobileLogo = styled.img`
  height: 1.75rem;
  width: 1.75rem;
  border-radius: ${({ theme }) => theme.radius.full};
  object-fit: cover;

  ${media.lg} {
    display: none;
  }
`;

const Welcome = styled.div`
  display: none;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};

  ${media.lg} {
    display: block;
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Avatar = styled.span`
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme }) => theme.color.brand};
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.onBrand};
`;

const RoleText = styled.span`
  display: none;
  font-size: 0.75rem;
  text-transform: capitalize;
  color: ${({ theme }) => theme.color.textMuted};

  ${media.sm} {
    display: block;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 25;
  backdrop-filter: blur(4px);
  background-color: rgba(15, 23, 42, 0.35);

  ${media.lg} {
    display: none;
  }
`;

const Drawer = styled.nav`
  position: relative;
  z-index: 30;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 0.75rem;

  > * + * {
    margin-top: 0.25rem;
  }

  ${media.lg} {
    display: none;
  }
`;

const DrawerSignOut = styled(SignOutButton)`
  width: 100%;
`;

const Main = styled.main`
  margin: 0 auto;
  padding: 1.25rem 1rem 6rem;

  ${media.sm} {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  ${media.lg} {
    padding-bottom: 2.5rem;
  }
`;

const BottomNav = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};

  ${media.lg} {
    display: none;
  }
`;

const BottomLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.5rem 0;
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme, $active }) => ($active ? theme.color.brand : theme.color.textMuted)};
`;

const BottomIcon = styled.span`
  font-size: 1rem;
`;

/** Sidebar on desktop, bottom nav on mobile. Nav items change by role. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = role ? NAV_BY_ROLE[role] : [];
  const bottomNav = nav.filter((item) => !item.mobileHidden);

  // Block background scroll and blur the rest of the app while the mobile drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(`${to}/`);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const navLinks = (onClick?: () => void) =>
    nav.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClick}
        $active={isActive(item.to)}
      >
        <span aria-hidden>{item.icon}</span>
        <NavLabel>{item.label}</NavLabel>
      </NavLink>
    ));

  return (
    <Root>
      <Sidebar>
        <BrandLink to="/">
          <BrandLogo src={logo} alt="" />
          <div>
            <BrandName>Transforming Experience</BrandName>
            <BrandSub>School Management</BrandSub>
          </div>
        </BrandLink>
        <SideNav>{navLinks()}</SideNav>
        <SignOutButton onClick={handleSignOut}>↩︎ Sign out</SignOutButton>
      </Sidebar>

      <Content>
        <Topbar>
          <TopbarLeft>
            <MenuButton
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              ☰
            </MenuButton>
            <MobileLogo src={logo} alt="" />
          </TopbarLeft>
          <Welcome>Welcome back, {user?.name ?? "there"}</Welcome>
          <TopRight>
            <ThemeToggle />
            <UserBox>
              <Avatar>{initials(user?.name ?? "TE")}</Avatar>
              <RoleText>{role}</RoleText>
            </UserBox>
          </TopRight>
        </Topbar>

        {menuOpen && (
          <Drawer>
            {navLinks(() => setMenuOpen(false))}
            <DrawerSignOut onClick={handleSignOut}>↩︎ Sign out</DrawerSignOut>
          </Drawer>
        )}
        {menuOpen && (
          <Backdrop onClick={() => setMenuOpen(false)} aria-hidden />
        )}

        <Main>{children}</Main>
      </Content>

      {bottomNav.length > 0 && (
        <BottomNav>
          {bottomNav.slice(0, BOTTOM_NAV_SLICE).map((item) => (
            <BottomLink key={item.to} to={item.to} $active={isActive(item.to)}>
              <BottomIcon aria-hidden>{item.icon}</BottomIcon>
              {item.label}
            </BottomLink>
          ))}
        </BottomNav>
      )}
    </Root>
  );
}
