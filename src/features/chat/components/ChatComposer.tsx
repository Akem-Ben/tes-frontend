import { useState, type FormEvent } from "react";
import styled from "styled-components";
import type { ChatMessage } from "@/shared/lib/mockStore";
import { Button, Input } from "@/shared/ui";
import { EmojiPicker } from "@/shared/components";

interface ChatComposerProps {
  replyTo?: { message: ChatMessage; senderName: string } | undefined;
  onCancelReply: () => void;
  onSend: (text: string) => void;
  onShareFeedback: () => void;
}

const Wrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 0.75rem;
`;

const ReplyBanner = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-left: 3px solid ${({ theme }) => theme.color.brand};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.color.muted};
  padding: 0.375rem 0.625rem;
`;

const ReplyInfo = styled.div`
  min-width: 0;
`;

const ReplyName = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.brand};
`;

const ReplyText = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const CancelButton = styled.button`
  font-size: 1rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Row = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
`;

const InputWrap = styled.div`
  flex: 1;
`;

const EmojiButtonWrap = styled.div`
  position: relative;
`;

const EmojiPopoverAnchor = styled.div`
  position: absolute;
  bottom: 2.75rem;
  left: 0;
`;

export function ChatComposer({
  replyTo,
  onCancelReply,
  onSend,
  onShareFeedback,
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <Wrapper>
      {replyTo && (
        <ReplyBanner>
          <ReplyInfo>
            <ReplyName>Replying to {replyTo.senderName}</ReplyName>
            <ReplyText>{replyTo.message.text || "Shared feedback"}</ReplyText>
          </ReplyInfo>
          <CancelButton
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            ✕
          </CancelButton>
        </ReplyBanner>
      )}
      <Row onSubmit={submit}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onShareFeedback}
        >
          💬 Share feedback
        </Button>
        <EmojiButtonWrap>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="Add an emoji"
          >
            😀
          </Button>
          {pickerOpen && (
            <EmojiPopoverAnchor>
              <EmojiPicker
                onSelect={(emoji) => {
                  setText((t) => t + emoji);
                  setPickerOpen(false);
                }}
                onClose={() => setPickerOpen(false)}
              />
            </EmojiPopoverAnchor>
          )}
        </EmojiButtonWrap>
        <InputWrap>
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </InputWrap>
        <Button type="submit" disabled={!text.trim()}>
          Send
        </Button>
      </Row>
    </Wrapper>
  );
}
