import { Link } from "react-router-dom";
import styled from "styled-components";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { media } from "@/theme";
import logo from "@/assets/pistis-logo.jpg";

const FooterEl = styled.footer`
  background: ${({ theme }) =>
    theme.name === "dark"
      ? `linear-gradient(160deg, ${theme.color.panel} 0%, #020617 100%)`
      : `linear-gradient(160deg, ${theme.color.brandDark} 0%, #0b1220 100%)`};
  color: rgba(255, 255, 255, 0.75);
  padding: 3.5rem 1.25rem 1.5rem;
`;

const Inner = styled.div`
  max-width: 72rem;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  gap: 2.25rem;
  grid-template-columns: 1fr;
  margin-bottom: 2.25rem;

  ${media.sm} {
    grid-template-columns: 1fr 1fr;
  }

  ${media.lg} {
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
`;

const LogoImg = styled.img`
  height: 2.75rem;
  width: 2.75rem;
  border-radius: ${({ theme }) => theme.radius.full};
  object-fit: cover;
`;

const OrgName = styled.p`
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
`;

const OrgSub = styled.p`
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  opacity: 0.65;
`;

const Note = styled.p`
  margin-top: 1rem;
  max-width: 22rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  opacity: 0.7;
`;

const Socials = styled.div`
  margin-top: 1.25rem;
  display: flex;
  gap: 0.5rem;
`;

const Social = styled.a`
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.75);
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
    color: #ffffff;
  }
`;

const ColTitle = styled.h3`
  position: relative;
  margin-bottom: 1rem;
  padding-left: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.125rem;
    bottom: 0.125rem;
    width: 3px;
    border-radius: ${({ theme }) => theme.radius.full};
    background-color: ${({ theme }) => theme.color.brand};
  }
`;

const ColLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const ColLink = styled(Link)`
  font-size: 0.8125rem;
  opacity: 0.75;

  &:hover {
    opacity: 1;
    color: #ffffff;
  }
`;

const ColText = styled.p`
  font-size: 0.8125rem;
  line-height: 1.6;
  opacity: 0.7;
`;

const Divider = styled.div`
  height: 1px;
  margin-bottom: 1.25rem;
  background-color: rgba(255, 255, 255, 0.12);
`;

const BottomBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.6;

  ${media.sm} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

export function Footer() {
  return (
    <FooterEl>
      <Inner>
        <Grid>
          <div>
            <LogoRow>
              <LogoImg src={logo} alt="Transforming Experience School logo" />
            </LogoRow>
            <OrgName>Transforming Experience School</OrgName>
            <OrgSub>School Management Portal</OrgSub>
            <Note>
              Raising disciplined, transformed men and women - one cohort, one
              group, one student at a time.
            </Note>
            <Socials>
              <Social href="#" aria-label="Instagram">
                <Instagram size={15} />
              </Social>
              <Social href="#" aria-label="Facebook">
                <Facebook size={15} />
              </Social>
              <Social href="#" aria-label="X (Twitter)">
                <Twitter size={15} />
              </Social>
            </Socials>
          </div>

          <div>
            <ColTitle>Explore</ColTitle>
            <ColLinks>
              <ColLink to="/">Home</ColLink>
              <ColLink to="/#about">About the School</ColLink>
            </ColLinks>
          </div>

          <div>
            <ColTitle>Sign In</ColTitle>
            <ColLinks>
              <ColLink to="/login/facilitator">Facilitator Login</ColLink>
              <ColLink to="/login/president">President Login</ColLink>
              <ColLink to="/login/admin">Admin Login</ColLink>
            </ColLinks>
          </div>

          <div>
            <ColTitle>Accounts</ColTitle>
            <ColText>
              Every login is issued by the school office - there is no public
              sign-up. Speak to your facilitator or the office if you need
              access.
            </ColText>
          </div>
        </Grid>

        <Divider />

        <BottomBar>
          <span>
            © {new Date().getFullYear()} Transforming Experience School. All
            rights reserved.
          </span>
          <span>Discipleship &amp; School Management Portal</span>
        </BottomBar>
      </Inner>
    </FooterEl>
  );
}
