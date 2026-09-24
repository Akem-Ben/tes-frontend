import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDb } from "@/shared/lib";
import { media } from "@/theme";

const Section = styled.section`
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.panel : "#f8fafc")};
  padding: 4rem 0;
`;

const Inner = styled.div`
  margin: 0 auto;
  max-width: 48rem;
  padding: 0 1.5rem;
  text-align: center;
`;

const Eyebrow = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.color.brand};
`;

const Blockquote = styled.blockquote`
  margin-top: 1.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.6;
  color: ${({ theme }) => theme.color.text};
  animation: tes-fade-in 1.2s ease both;

  ${media.sm} {
    font-size: 1.5rem;
  }
`;

const Author = styled.p`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Controls = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const ArrowButton = styled.button`
  height: 2.25rem;
  width: 2.25rem;
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid ${({ theme }) => theme.color.borderStrong};
  color: ${({ theme }) => theme.color.textMuted};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.card : "#ffffff")};
  }
`;

const Dots = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Dot = styled.button<{ $active: boolean }>`
  height: 0.625rem;
  width: ${({ $active }) => ($active ? "1.5rem" : "0.625rem")};
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme, $active }) => ($active ? theme.color.brand : theme.color.borderStrong)};
  transition: all 0.2s ease;
`;

export function QuoteCarousel() {
  const db = useDb();
  const quotes = db.quotes.filter((q) => q.active);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quotes.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % quotes.length),
      7000,
    );
    return () => window.clearInterval(id);
  }, [quotes.length]);

  if (quotes.length === 0) return null;
  const quote = quotes[index] ?? quotes[0]!;
  const go = (step: number) =>
    setIndex((i) => (i + step + quotes.length) % quotes.length);

  return (
    <Section>
      <Inner>
        <Eyebrow>Words from the President</Eyebrow>
        <Blockquote key={quote.id}>“{quote.text}”</Blockquote>
        <Author>— {quote.author}</Author>

        <Controls>
          <ArrowButton onClick={() => go(-1)} aria-label="Previous quote">
            ‹
          </ArrowButton>
          <Dots>
            {quotes.map((q, i) => (
              <Dot
                key={q.id}
                aria-label={`Go to quote ${i + 1}`}
                onClick={() => setIndex(i)}
                $active={i === index}
              />
            ))}
          </Dots>
          <ArrowButton onClick={() => go(1)} aria-label="Next quote">
            ›
          </ArrowButton>
        </Controls>
      </Inner>
    </Section>
  );
}
