import styled from "styled-components";
import { Card, ProgressBar } from "@/shared/ui";
import type { StudentSummary } from "../api/types";

const Stack = styled.div`
  > * + * {
    margin-top: 1rem;
  }
`;

const TypeSection = styled.div`
  padding-top: 0.5rem;
`;

const TypeLabel = styled.p`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
`;

const TypeStack = styled.div`
  > * + * {
    margin-top: 0.75rem;
  }
`;

export function StudentSummaryCard({ summary }: { summary: StudentSummary }) {
  return (
    <Card title="Progress summary">
      <Stack>
        <ProgressBar
          label="Attendance (all types)"
          value={summary.attendanceRate}
        />
        <ProgressBar
          label="Assignment submissions"
          value={summary.submissionRate}
          caption={`${summary.submitted}/${summary.assignmentsTotal} · ${summary.submissionRate}%`}
        />
        <ProgressBar label="Sign-in consistency" value={summary.signInRate} />
        <ProgressBar label="Sign-out consistency" value={summary.signOutRate} />
        {summary.attendanceByType.length > 0 && (
          <TypeSection>
            <TypeLabel>Attendance by type</TypeLabel>
            <TypeStack>
              {summary.attendanceByType.map((t) => (
                <ProgressBar
                  key={t.type}
                  label={t.type}
                  value={t.rate}
                  caption={`${t.attended}/${t.total} · ${t.rate}%`}
                />
              ))}
            </TypeStack>
          </TypeSection>
        )}
      </Stack>
    </Card>
  );
}
