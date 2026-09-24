import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import { media } from "@/theme";

const photos = [hero1, hero2, hero3];

const Section = styled.section`
  position: relative;
  display: flex;
  min-height: 85vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Photo = styled.img<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 1s ease;
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
`;

const Inner = styled.div`
  position: relative;
  margin: 0 auto;
  max-width: 48rem;
  padding: 6rem 1.5rem;
  text-align: center;
  animation: tes-fade-in 1.2s ease both;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme }) => theme.color.brand};
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.color.onBrand};
`;

const Title = styled.h1`
  margin-top: 1.25rem;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;

  ${media.sm} {
    font-size: 3rem;
  }
`;

const Lead = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  color: #e2e8f0;

  ${media.sm} {
    font-size: 1.125rem;
  }
`;

const Actions = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
`;

const PrimaryAction = styled(Link)`
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.brand};
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.onBrand};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.brandDark};
  }
`;

const SecondaryAction = styled.a`
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      6000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <Section>
      {photos.map((src, i) => (
        <Photo
          key={src}
          src={src}
          alt="Transforming Experience School campus life"
          width={1600}
          height={900}
          $visible={i === index}
        />
      ))}
      <Scrim />
      <Inner>
        {/* <Pill>Single Portal</Pill> */}
        <Title>Transforming Experience School Management Portal</Title>
        <Lead>
          Raising disciplined, transformed men and women — one cohort, one
          group, one student at a time.
        </Lead>
        <Actions>
          {/* <PrimaryAction to="/login/facilitator">
            Facilitator Login
          </PrimaryAction> */}
          <SecondaryAction href="#about">About the School</SecondaryAction>
        </Actions>
      </Inner>
    </Section>
  );
}
