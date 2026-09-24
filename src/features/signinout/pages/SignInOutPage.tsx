import { useState } from "react";
import styled from "styled-components";
import type { Student } from "@/shared/lib/mockStore";
import { Card, Badge, Button, Input } from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { clearMark, markSignIn, markSignOut, windowStatus } from "../api";
import { useGroupParam } from "@/features/groups";
import { formatDate, nowTime, todayISO } from "@/shared/lib";

const DateRow = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
`;

const DateText = styled.p`
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const StudentList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const StudentItem = styled.li`
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const StudentRow = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const StudentInfo = styled.div`
  min-width: 0;
`;

const StudentName = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const StudentMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;

const statusLabel = (
  status: ReturnType<typeof windowStatus>,
  student: Pick<Student, "hourOfPriesthood" | "hourOfPriesthoodEnd">,
) => {
  if (status === "none") return null;
  if (status === "before") return `Opens at ${student.hourOfPriesthood}`;
  if (status === "closed")
    return `Window closed at ${student.hourOfPriesthoodEnd}`;
  return "Active now";
};

export function SignInOutPage() {
  const db = useDb();
  const { group } = useGroupParam();
  const [date, setDate] = useState(todayISO());
  const isToday = date === todayISO();

  if (!group) {
    return (
      <EmptyState
        icon="⏰"
        title="Group not found"
        message="This group no longer exists."
      />
    );
  }

  const students = db.students.filter(
    (s) => s.groupIds.includes(group.id) && s.isActive,
  );
  const records = db.signInOuts.filter((r) => r.date === date);

  return (
    <>
      <BackLink to={`/groups/${group.id}`} label={`Back to ${group.name}`} />
      <PageHeader
        title="Sign In / Out"
        subtitle={`${group.name} · Daily priesthood-hour tracking`}
      />

      <Card>
        <DateRow>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <DateText>{formatDate(date)}</DateText>
        </DateRow>

        {students.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No active students"
            message="Add students to this group first."
          />
        ) : (
          <StudentList>
            {students.map((s) => {
              const record = records.find((r) => r.studentId === s.id);
              const status = windowStatus(s);
              const locked =
                isToday && status !== "active" && status !== "none";
              return (
                <StudentItem key={s.id}>
                  <StudentRow>
                    <StudentInfo>
                      <StudentName>{s.name}</StudentName>
                      <StudentMeta>
                        Hour {s.hourOfPriesthood ?? "—"}
                        {s.hourOfPriesthoodEnd
                          ? `–${s.hourOfPriesthoodEnd}`
                          : ""}{" "}
                        · {s.registrationNumber}
                      </StudentMeta>
                    </StudentInfo>
                    {record?.signedIn && record?.signedOut ? (
                      <Badge tone="green">Complete</Badge>
                    ) : (
                      isToday &&
                      statusLabel(status, s) && (
                        <Badge tone={status === "active" ? "green" : "slate"}>
                          {statusLabel(status, s)}
                        </Badge>
                      )
                    )}
                  </StudentRow>
                  <Actions>
                    {record?.signedIn ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => clearMark(s.id, date, "in")}
                      >
                        ✓ In {record.timeIn} (undo)
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        disabled={locked}
                        onClick={() => markSignIn(s.id, date, nowTime())}
                      >
                        Sign in
                      </Button>
                    )}
                    {record?.signedOut ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => clearMark(s.id, date, "out")}
                      >
                        ✓ Out {record.timeOut} (undo)
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={locked}
                        onClick={() => markSignOut(s.id, date, nowTime())}
                      >
                        Sign out
                      </Button>
                    )}
                  </Actions>
                </StudentItem>
              );
            })}
          </StudentList>
        )}
      </Card>
    </>
  );
}
