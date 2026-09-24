import { Link } from "react-router-dom";
import styled from "styled-components";
import { Hero } from "../components/Hero";
import { QuoteCarousel } from "../components/QuoteCarousel";
import { AboutSection } from "../components/AboutSection";
import { Footer } from "../components/Footer";
import { StickyRoleButtons } from "../components/StickyRoleButtons";
import { ThemeToggle } from "@/shared/components";
import { media } from "@/theme";
import logo from "@/assets/pistis-logo.jpg";

const Page = styled.div`
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.bg : "#ffffff")};
  padding-bottom: 5rem;

  ${media.sm} {
    padding-bottom: 0;
  }
`;

const Header = styled.header`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
`;

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.4));
`;

const BrandLogo = styled.img`
  height: 2.25rem;
  width: 2.25rem;
  border-radius: ${({ theme }) => theme.radius.full};
  object-fit: cover;
`;

export function LandingPage() {
  return (
    <Page>
      <Header>
        <BrandLink to="/">
          <BrandLogo src={logo} alt="" />
          Transforming Experience School
        </BrandLink>
        <ThemeToggle />
      </Header>

      <Hero />
      <QuoteCarousel />
      <AboutSection />
      <Footer />

      <StickyRoleButtons />
    </Page>
  );
}
