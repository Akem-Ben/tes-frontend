import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, Modal } from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useFacilitatorId } from "@/features/auth";
import { useActiveGroup } from "@/features/groups";
import { listFeedbackForGroups } from "@/features/feedback";
import { listMessages, sendMessage } from "../api";
import { MessageBubble } from "../components/MessageBubble";
import { ChatComposer } from "../components/ChatComposer";
import type { ChatMessage } from "../api/types";

const Wrapper = styled.div`
  display: flex;
  height: calc(100vh - 8rem);
  flex-direction: column;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  overflow: hidden;
`;

const MembersBar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Thread = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  > * + * {
    margin-top: 0.75rem;
  }
`;

const FeedbackOption = styled.button`
  display: block;
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.625rem 0.75rem;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
  }

  & + & {
    margin-top: 0.5rem;
  }
`;

const FeedbackOptionStudent = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
`;

const FeedbackOptionText = styled.p`
  margin-top: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function ChatRoomPage() {
  const { roomId = "" } = useParams<{ roomId: string }>();
  const db = useDb();
  const facilitatorId = useFacilitatorId();
  const { groups } = useActiveGroup();
  const room = db.chatRooms.find((r) => r.id === roomId);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  // useDb() above re-renders this component on every store change, so recomputing here is cheap and always fresh.
  const messages = listMessages(roomId);
  const feedbackOptions = listFeedbackForGroups(groups.map((g) => g.id));

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages.length]);

  if (!room) {
    return (
      <EmptyState
        icon="🔍"
        title="Room not found"
        message="This chat room no longer exists."
      />
    );
  }

  const senderName = (id: string) =>
    db.facilitators.find((f) => f.id === id)?.name ?? "Unknown";

  const send = (text: string) => {
    sendMessage({
      roomId,
      senderId: facilitatorId,
      text,
      replyToId: replyTo?.id,
    });
    setReplyTo(null);
  };

  const shareFeedback = (feedbackId: string) => {
    sendMessage({
      roomId,
      senderId: facilitatorId,
      text: "",
      sharedFeedbackId: feedbackId,
    });
    setShareOpen(false);
  };

  return (
    <>
      <BackLink to="/chat" label="Back to Chat" />
      <PageHeader
        title={room.name}
        subtitle={`${room.facilitatorIds.length} facilitators`}
      />

      <Wrapper>
        <MembersBar>
          {room.facilitatorIds.map((id) => senderName(id)).join(", ")}
        </MembersBar>

        <Thread ref={threadRef}>
          {messages.length === 0 && (
            <EmptyState
              icon="💬"
              title="No messages yet"
              message="Say hello to get the conversation started."
            />
          )}
          {messages.map((m) => {
            const reply = m.replyToId
              ? messages.find((x) => x.id === m.replyToId)
              : undefined;
            const feedback = m.sharedFeedbackId
              ? db.feedback.find((f) => f.id === m.sharedFeedbackId)
              : undefined;
            const student = feedback
              ? db.students.find((s) => s.id === feedback.studentId)
              : undefined;
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isOwn={m.senderId === facilitatorId}
                senderName={senderName(m.senderId)}
                replyPreview={
                  reply
                    ? {
                        senderName: senderName(reply.senderId),
                        text: reply.text || "Shared feedback",
                      }
                    : undefined
                }
                sharedFeedback={
                  feedback && student
                    ? { studentName: student.name, feedback }
                    : undefined
                }
                onReply={() => setReplyTo(m)}
              />
            );
          })}
        </Thread>

        <ChatComposer
          replyTo={
            replyTo
              ? { message: replyTo, senderName: senderName(replyTo.senderId) }
              : undefined
          }
          onCancelReply={() => setReplyTo(null)}
          onSend={send}
          onShareFeedback={() => setShareOpen(true)}
        />
      </Wrapper>

      <Modal
        open={shareOpen}
        title="Share feedback"
        onClose={() => setShareOpen(false)}
      >
        {feedbackOptions.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No feedback to share"
            message="Log feedback for a student first, then share it here."
          />
        ) : (
          feedbackOptions.map((f) => {
            const student = db.students.find((s) => s.id === f.studentId);
            return (
              <FeedbackOption
                key={f.id}
                type="button"
                onClick={() => shareFeedback(f.id)}
              >
                <FeedbackOptionStudent>
                  {student?.name ?? "—"}
                </FeedbackOptionStudent>
                <FeedbackOptionText>{f.message}</FeedbackOptionText>
              </FeedbackOption>
            );
          })
        )}
      </Modal>
    </>
  );
}
