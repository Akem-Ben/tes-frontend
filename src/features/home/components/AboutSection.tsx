import styled from "styled-components";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import about3 from "@/assets/about-3.jpg";
import { media } from "@/theme";

const photos = [
  { src: about1, alt: "Students studying together" },
  { src: about2, alt: "A facilitator mentoring students outdoors" },
  { src: about3, alt: "A student reading in the school library" },
];

const stats = [
  { label: "Cohorts run", value: "4+" },
  { label: "Students formed", value: "60+" },
  // { label: "Facilitators", value: "45" },
];

const Section = styled.section`
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.bg : "#ffffff")};
  padding: 4rem 0;
`;

const Grid = styled.div`
  margin: 0 auto;
  display: grid;
  max-width: 72rem;
  gap: 2.5rem;
  padding: 0 1.5rem;

  ${media.lg} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: center;
  }
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};

  ${media.sm} {
    font-size: 1.875rem;
  }
`;

const Paragraph = styled.p<{ $tight?: boolean }>`
  margin-top: ${({ $tight }) => ($tight ? "0.75rem" : "1rem")};
  color: ${({ theme }) => theme.color.textBody};
`;

const StatList = styled.dl`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
`;

const StatBox = styled.div`
  border-radius: ${({ theme }) => theme.radius.xl};
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.panel : "#f8fafc")};
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.dt`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.brand};
`;

const StatLabel = styled.dd`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
`;

const Photo = styled.img<{ $wide: boolean }>`
  height: 12rem;
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.xl};
  object-fit: cover;
  grid-column: ${({ $wide }) => ($wide ? "span 2 / span 2" : "auto")};

  ${media.sm} {
    height: 15rem;
  }
`;

export function AboutSection() {
  return (
    <Section id="about">
      <Grid>
        <div>
          <Heading>About the School</Heading>
          <Paragraph>
            Transforming Experience School exists to build character before
            career. Students are grouped into sessions, guided daily by
            facilitators, and tracked through priesthood hours, prayer meetings,
            classes and personal assignments.
          </Paragraph>
          <Paragraph $tight>
            Every facilitator has one clear duty on this portal: mark the day,
            follow up the student, and see real progress in simple numbers.
          </Paragraph>
          <StatList>
            {stats.map((s) => (
              <StatBox key={s.label}>
                <StatValue>{s.value}</StatValue>
                <StatLabel>{s.label}</StatLabel>
              </StatBox>
            ))}
          </StatList>
        </div>
        <PhotoGrid>
          {photos.map((p, i) => (
            <Photo
              key={p.src}
              src={p.src}
              alt={p.alt}
              loading="lazy"
              width={800}
              height={800}
              $wide={i === 0}
            />
          ))}
        </PhotoGrid>
      </Grid>
    </Section>
  );
}
