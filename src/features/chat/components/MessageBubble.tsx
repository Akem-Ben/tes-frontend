import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import styled from "styled-components";
import type { ChatMessage, Feedback } from "@/shared/lib/mockStore";
import { EmojiPicker } from "@/shared/components";

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  senderName: string;
  replyPreview?: { senderName: string; text: string } | undefined;
  sharedFeedback?: { studentName: string; feedback: Feedback } | undefined;
  reactions: ReactionSummary[];
  onReply: () => void;
  onReact: (emoji: string) => void;
}

const SWIPE_THRESHOLD = 48;
const PRESS_DURATION = 450;

const Row = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  position: relative;
`;

const Stack = styled.div<{ $isOwn: boolean }>`
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
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
  max-width: 100%;
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

const ContextMenu = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  min-width: 9rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.card};
  box-shadow: ${({ theme }) => theme.shadow.xl};
  padding: 0.25rem;
`;

const ContextMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0.5rem 0.625rem;
  text-align: left;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.textBody};

  &:hover {
    background-color: ${({ theme }) => theme.color.muted};
  }
`;

const ReactionsRow = styled.div<{ $isOwn: boolean }>`
  margin-top: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  gap: 0.25rem;
`;

const ReactionPill = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.color.brand : theme.color.border)};
  background-color: ${({ theme, $active }) => ($active ? theme.tone.brand.bg : theme.color.card)};
  padding: 0.0625rem 0.4375rem;
  font-size: 0.75rem;
  color: ${({ theme, $active }) => ($active ? theme.tone.brand.fg : theme.color.textBody)};
`;

/**
 * WhatsApp-style interactions: swipe the bubble right (touch) or press-and-hold (mouse) to reply,
 * right-click for a menu with React/Reply, and tap a reaction pill to toggle your own reaction.
 */
export function MessageBubble({
  message,
  isOwn,
  senderName,
  replyPreview,
  sharedFeedback,
  reactions,
  onReply,
  onReact,
}: MessageBubbleProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [pickerFor, setPickerFor] = useState<"menu" | null>(null);
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

  const openMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => {
    setMenuPos(null);
    setPickerFor(null);
  };

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
      <Stack $isOwn={isOwn}>
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
          onContextMenu={openMenu}
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
              <FeedbackMessage>
                {sharedFeedback.feedback.message}
              </FeedbackMessage>
            </FeedbackCard>
          )}
          {message.text && <Text>{message.text}</Text>}
          <Time $isOwn={isOwn}>{formatTime(message.createdAt)}</Time>
        </Bubble>

        {reactions.length > 0 && (
          <ReactionsRow $isOwn={isOwn}>
            {reactions.map((r) => (
              <ReactionPill
                key={r.emoji}
                type="button"
                $active={r.reactedByMe}
                onClick={() => onReact(r.emoji)}
              >
                <span aria-hidden>{r.emoji}</span>
                {r.count}
              </ReactionPill>
            ))}
          </ReactionsRow>
        )}
      </Stack>

      {menuPos && !pickerFor && (
        <ContextMenu $x={menuPos.x} $y={menuPos.y}>
          <ContextMenuButton type="button" onClick={() => setPickerFor("menu")}>
            😀 React
          </ContextMenuButton>
          <ContextMenuButton
            type="button"
            onClick={() => {
              onReply();
              closeMenu();
            }}
          >
            ↩ Reply
          </ContextMenuButton>
        </ContextMenu>
      )}
      {menuPos && pickerFor && (
        <div
          style={{
            position: "fixed",
            top: menuPos.y,
            left: menuPos.x,
            zIndex: 50,
          }}
        >
          <EmojiPicker
            onSelect={(emoji) => {
              onReact(emoji);
              closeMenu();
            }}
            onClose={closeMenu}
          />
        </div>
      )}
    </Row>
  );
}
