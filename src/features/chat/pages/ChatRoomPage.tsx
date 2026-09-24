import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, Modal, Badge } from "@/shared/ui";
import { PageHeader, EmptyState, BackLink } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useAuth } from "@/features/auth";
import { useActiveGroup } from "@/features/groups";
import { listFeedbackForGroups } from "@/features/feedback";
import type { ChatMemberRole } from "@/shared/lib/mockStore";
import {
  addMemberToRoom,
  listMessages,
  listReactions,
  sendMessage,
  toggleReaction,
} from "../api";
import {
  MessageBubble,
  type ReactionSummary,
} from "../components/MessageBubble";
import { ChatComposer } from "../components/ChatComposer";
import { MemberSearchModal } from "../components/MemberSearchModal";
import type { ChatMessage, ChatSearchResult } from "../api/types";

const Wrapper = styled.div`
  display: flex;
  height: calc(100vh - 8rem);
  flex-direction: column;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  overflow: hidden;
`;

const MembersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 0.5rem 0.75rem;
`;

const MembersText = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
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

const OversightNote = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.625rem 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
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
  const { user, role } = useAuth();
  const memberId = user?.id ?? "";
  const memberRole: ChatMemberRole =
    role === "facilitator" ? "facilitator" : "admin";
  const { groups } = useActiveGroup();
  const room = db.chatRooms.find((r) => r.id === roomId);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
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

  const isMember =
    room.facilitatorIds.includes(memberId) || room.adminIds.includes(memberId);
  const canSend = role !== "superadmin" || isMember;

  const senderName = (id: string, senderRole: ChatMemberRole) =>
    senderRole === "admin"
      ? (db.admins.find((a) => a.id === id)?.name ?? "Unknown")
      : (db.facilitators.find((f) => f.id === id)?.name ?? "Unknown");

  const reactionsFor = (messageId: string): ReactionSummary[] => {
    const rows = listReactions(messageId);
    const byEmoji = new Map<string, ReactionSummary>();
    rows.forEach((r) => {
      const current = byEmoji.get(r.emoji) ?? {
        emoji: r.emoji,
        count: 0,
        reactedByMe: false,
      };
      current.count += 1;
      if (r.memberId === memberId && r.memberRole === memberRole)
        current.reactedByMe = true;
      byEmoji.set(r.emoji, current);
    });
    return Array.from(byEmoji.values());
  };

  const send = (text: string) => {
    sendMessage({
      roomId,
      senderId: memberId,
      senderRole: memberRole,
      text,
      replyToId: replyTo?.id,
    });
    setReplyTo(null);
  };

  const shareFeedback = (feedbackId: string) => {
    sendMessage({
      roomId,
      senderId: memberId,
      senderRole: memberRole,
      text: "",
      sharedFeedbackId: feedbackId,
    });
    setShareOpen(false);
  };

  const addMember = (result: ChatSearchResult) => {
    addMemberToRoom(roomId, result.type, result.id);
    setAddOpen(false);
  };

  const memberIds = [
    ...room.facilitatorIds,
    ...room.adminIds,
    ...room.studentIds,
  ];

  return (
    <>
      <BackLink to="/chat" label="Back to Chat" />
      <PageHeader
        title={room.name}
        subtitle={`${room.facilitatorIds.length + room.adminIds.length} members${room.studentIds.length > 0 ? ` · ${room.studentIds.length} student(s) tagged` : ""}`}
      />

      <Wrapper>
        <MembersBar>
          <MembersText>
            {room.facilitatorIds
              .map((id) => senderName(id, "facilitator"))
              .join(", ")}
            {room.adminIds.length > 0 &&
              `${room.facilitatorIds.length > 0 ? " · " : ""}${room.adminIds
                .map((id) => senderName(id, "admin"))
                .join(", ")}`}
            {room.studentIds.length > 0 && (
              <>
                {" · Tagged: "}
                {room.studentIds
                  .map(
                    (id) => db.students.find((s) => s.id === id)?.name ?? "—",
                  )
                  .join(", ")}
              </>
            )}
          </MembersText>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAddOpen(true)}
          >
            + Add member
          </Button>
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
                isOwn={m.senderId === memberId && m.senderRole === memberRole}
                senderName={senderName(m.senderId, m.senderRole)}
                replyPreview={
                  reply
                    ? {
                        senderName: senderName(
                          reply.senderId,
                          reply.senderRole,
                        ),
                        text: reply.text || "Shared feedback",
                      }
                    : undefined
                }
                sharedFeedback={
                  feedback && student
                    ? { studentName: student.name, feedback }
                    : undefined
                }
                reactions={reactionsFor(m.id)}
                onReply={() => setReplyTo(m)}
                onReact={(emoji) =>
                  toggleReaction(m.id, memberId, memberRole, emoji)
                }
              />
            );
          })}
        </Thread>

        {canSend ? (
          <ChatComposer
            replyTo={
              replyTo
                ? {
                    message: replyTo,
                    senderName: senderName(
                      replyTo.senderId,
                      replyTo.senderRole,
                    ),
                  }
                : undefined
            }
            onCancelReply={() => setReplyTo(null)}
            onSend={send}
            onShareFeedback={() => setShareOpen(true)}
          />
        ) : (
          <OversightNote>
            Viewing as Super Admin - not a member of this room, so you can watch
            but not send messages.
          </OversightNote>
        )}
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

      <MemberSearchModal
        open={addOpen}
        title="Add a member"
        excludeIds={memberIds}
        onClose={() => setAddOpen(false)}
        onAdd={addMember}
      />
    </>
  );
}
