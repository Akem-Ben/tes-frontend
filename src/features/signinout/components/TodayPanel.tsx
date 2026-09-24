import { Link } from "react-router-dom";
import styled from "styled-components";
import type { SignInOut, Student } from "@/shared/lib/mockStore";
import { Badge, Button } from "@/shared/ui";
import { EmptyState } from "@/shared/components";
import { windowStatus } from "../api";

interface TodayPanelProps {
  students: Student[];
  records: SignInOut[];
  groupId: string;
}

const Wrapper = styled.div`
  > * + * {
    margin-top: 0.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.5rem 0.75rem;
`;

const StudentInfo = styled.div`
  min-width: 0;
`;

const StudentName = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const StudentMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const BadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LinkWrap = styled(Link)`
  display: block;
  padding-top: 0.5rem;
`;

const FullButton = styled(Button)`
  width: 100%;
`;

/** Students whose priesthood-hour window is active right now and still unmarked. */
export function TodayPanel({ students, records, groupId }: TodayPanelProps) {
  const due = students.filter((s) => {
    if (!s.isActive || windowStatus(s) !== "active") return false;
    const record = records.find((r) => r.studentId === s.id);
    return !record || !record.signedIn || !record.signedOut;
  });

  if (due.length === 0) {
    return (
      <EmptyState
        icon="🎉"
        title="Nothing pending right now"
        message="No student's priesthood-hour window is open and unmarked at the moment."
      />
    );
  }

  return (
    <Wrapper>
      {due.slice(0, 6).map((s) => {
        const record = records.find((r) => r.studentId === s.id);
        return (
          <Row key={s.id}>
            <StudentInfo>
              <StudentName>{s.name}</StudentName>
              <StudentMeta>
                Hour {s.hourOfPriesthood}–{s.hourOfPriesthoodEnd}
              </StudentMeta>
            </StudentInfo>
            <BadgeGroup>
              {!record?.signedIn && <Badge tone="amber">Sign in</Badge>}
              {!record?.signedOut && <Badge tone="slate">Sign out</Badge>}
            </BadgeGroup>
          </Row>
        );
      })}
      <LinkWrap to={`/groups/${groupId}/signinout`}>
        <FullButton size="sm">
          Mark {due.length} pending student{due.length === 1 ? "" : "s"}
        </FullButton>
      </LinkWrap>
    </Wrapper>
  );
}
