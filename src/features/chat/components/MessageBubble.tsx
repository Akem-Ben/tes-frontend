import { useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import styled from "styled-components";
import type { ChatMessage, Feedback } from "@/shared/lib/mockStore";

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  senderName: string;
  replyPreview?: { senderName: string; text: string } | undefined;
  sharedFeedback?: { studentName: string; feedback: Feedback } | undefined;
  onReply: () => void;
}

const SWIPE_THRESHOLD = 48;
const PRESS_DURATION = 450;

const Row = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  position: relative;
`;

const ReplyHint = styled.div<{ $visible: number }>`
  position: absolute;
  top: 50%;
  left: 0.5rem;
  transform: translateY(-50%);
  opacity: ${({ $visible }) => $visible};
  font-size: 1rem;
  color: ${({ theme }) => theme.color.brand};
  pointer-events: none;
`;

const Bubble = styled.div<{
  $isOwn: boolean;
  $selected: boolean;
  $offset: number;
  $dragging: boolean;
}>`
  max-width: 80%;
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0.5rem 0.75rem;
  background-color: ${({ theme, $isOwn }) => ($isOwn ? theme.color.brand : theme.color.muted)};
  color: ${({ theme, $isOwn }) => ($isOwn ? theme.color.onBrand : theme.color.text)};
  box-shadow: ${({ theme, $selected }) => ($selected ? `0 0 0 2px ${theme.color.brand}` : "none")};
  transform: translateX(${({ $offset }) => $offset}px);
  transition: ${({ $dragging }) => ($dragging ? "none" : "transform 0.2s ease, box-shadow 0.15s ease")};
  cursor: pointer;
  user-select: none;
`;

const SenderName = styled.p<{ $isOwn: boolean }>`
  margin-bottom: 0.125rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, $isOwn }) => ($isOwn ? "rgba(255,255,255,0.85)" : theme.color.brand)};
`;

const ReplyQuote = styled.div<{ $isOwn: boolean }>`
  margin-bottom: 0.375rem;
  border-left: 3px solid
    ${({ theme, $isOwn }) => ($isOwn ? "rgba(255,255,255,0.6)" : theme.color.brand)};
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  opacity: 0.85;
`;

const ReplyQuoteName = styled.p`
  font-weight: 600;
`;

const ReplyQuoteText = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FeedbackCard = styled.div<{ $isOwn: boolean }>`
  margin-bottom: 0.375rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ $isOwn }) => ($isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)")};
  padding: 0.5rem;
`;

const FeedbackTag = styled.p`
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
`;

const FeedbackStudent = styled.p`
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
`;

const FeedbackMessage = styled.p`
  margin-top: 0.125rem;
  font-size: 0.8125rem;
`;

const Text = styled.p`
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Time = styled.p<{ $isOwn: boolean }>`
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  opacity: 0.75;
  text-align: right;
`;

const ActionBar = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  top: -1.75rem;
  ${({ $isOwn }) => ($isOwn ? "right: 0;" : "left: 0;")}
  display: flex;
  gap: 0.25rem;
  z-index: 5;
`;

const ActionButton = styled.button`
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.color.card};
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    background-color: ${({ theme }) => theme.color.hover};
  }
`;

/**
 * WhatsApp-style reply gesture: swipe the bubble right on touch devices, or press and
 * hold with a mouse to select it, then tap the Reply action that appears above it.
 */
export function MessageBubble({
  message,
  isOwn,
  senderName,
  replyPreview,
  sharedFeedback,
  onReply,
}: MessageBubbleProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pressTimer = useRef<number | undefined>(undefined);

  const clearPressTimer = () => {
    if (pressTimer.current !== undefined) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = undefined;
    }
  };

  const handleTouchStart = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setDragging(true);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = Math.abs(touch.clientY - touchStart.current.y);
    if (deltaX > 0 && deltaY < 40) {
      setOffset(Math.min(deltaX, SWIPE_THRESHOLD + 16));
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (offset > SWIPE_THRESHOLD) onReply();
    setOffset(0);
    touchStart.current = null;
  };

  const handleMouseDown = () => {
    clearPressTimer();
    pressTimer.current = window.setTimeout(
      () => setSelected(true),
      PRESS_DURATION,
    );
  };

  const cancelPress = () => clearPressTimer();

  return (
    <Row $isOwn={isOwn}>
      <ReplyHint $visible={Math.min(offset / SWIPE_THRESHOLD, 1)}>↩</ReplyHint>
      {selected && (
        <ActionBar $isOwn={isOwn}>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onReply();
              setSelected(false);
            }}
          >
            ↩ Reply
          </ActionButton>
        </ActionBar>
      )}
      <Bubble
        $isOwn={isOwn}
        $selected={selected}
        $offset={offset}
        $dragging={dragging}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onClick={() => selected && setSelected(false)}
      >
        {!isOwn && <SenderName $isOwn={isOwn}>{senderName}</SenderName>}
        {replyPreview && (
          <ReplyQuote $isOwn={isOwn}>
            <ReplyQuoteName>{replyPreview.senderName}</ReplyQuoteName>
            <ReplyQuoteText>{replyPreview.text}</ReplyQuoteText>
          </ReplyQuote>
        )}
        {sharedFeedback && (
          <FeedbackCard $isOwn={isOwn}>
            <FeedbackTag>Shared feedback</FeedbackTag>
            <FeedbackStudent>{sharedFeedback.studentName}</FeedbackStudent>
            <FeedbackMessage>{sharedFeedback.feedback.message}</FeedbackMessage>
          </FeedbackCard>
        )}
        {message.text && <Text>{message.text}</Text>}
        <Time $isOwn={isOwn}>{formatTime(message.createdAt)}</Time>
      </Bubble>
    </Row>
  );
}
