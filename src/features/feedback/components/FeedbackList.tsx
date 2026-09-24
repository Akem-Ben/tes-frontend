import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Card, Button, Input } from "@/shared/ui";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { formatDate, todayISO } from "@/shared/lib";
import { createFeedback, listFeedbackForStudent } from "../api";

const FeedbackCard = styled(Card)`
  margin-top: 1rem;
`;

const List = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const Item = styled.li`
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;
`;

const ItemDate = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textMuted};
`;

const ItemMessage = styled.p`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const EmptyText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Form = styled.form`
  margin-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  padding-top: 1rem;

  > * + * {
    margin-top: 0.75rem;
  }
`;

interface FeedbackListProps {
  studentId: string;
  /** Needed to log new feedback - omit for a read-only view (e.g. president/admin browsing). */
  groupId?: string | undefined;
}

/** Embeds in the student profile, and is reused as-is by the standalone Feedback tab. */
export function FeedbackList({ studentId, groupId }: FeedbackListProps) {
  const { role } = useAuth();
  const facilitatorId = useFacilitatorId();
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [message, setMessage] = useState("");
  const items = listFeedbackForStudent(studentId);
  const canAdd = role === "facilitator" && Boolean(groupId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!groupId || !message.trim()) return;
    createFeedback({
      studentId,
      groupId,
      facilitatorId,
      date,
      message: message.trim(),
    });
    setMessage("");
    setDate(todayISO());
    setAdding(false);
  };

  return (
    <FeedbackCard
      title="Feedback"
      subtitle="What the student has shared with their facilitator"
      action={
        canAdd && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAdding((a) => !a)}
          >
            {adding ? "Cancel" : "+ Add feedback"}
          </Button>
        )
      }
    >
      {items.length === 0 && !adding ? (
        <EmptyText>No feedback logged yet.</EmptyText>
      ) : (
        <List>
          {items.map((f) => (
            <Item key={f.id}>
              <ItemDate>{formatDate(f.date)}</ItemDate>
              <ItemMessage>{f.message}</ItemMessage>
            </Item>
          ))}
        </List>
      )}

      {adding && (
        <Form onSubmit={submit}>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            textarea
            label="Feedback"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What did the student share?"
            required
          />
          <Button type="submit" size="sm">
            Save feedback
          </Button>
        </Form>
      )}
    </FeedbackCard>
  );
}
