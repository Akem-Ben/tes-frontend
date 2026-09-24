import { useEffect, useRef } from "react";
import styled from "styled-components";

/** A small curated set - enough range for reactions and everyday messages without a new dependency. */
const EMOJIS = [
  "😀",
  "😂",
  "😊",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "😢",
  "😭",
  "😮",
  "😡",
  "🥳",
  "😴",
  "🙏",
  "👍",
  "👎",
  "👏",
  "🙌",
  "💪",
  "🤝",
  "✌️",
  "🤞",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "✅",
  "❌",
  "⏰",
  "📖",
  "🙌",
  "😇",
  "🤗",
  "😅",
  "🫡",
  "👋",
  "🥲",
  "😆",
  "🤩",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const Popover = styled.div`
  position: absolute;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.125rem;
  width: 16rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.card};
  box-shadow: ${({ theme }) => theme.shadow.xl};
  padding: 0.5rem;
`;

const EmojiButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0.25rem;
  font-size: 1.125rem;
  line-height: 1;

  &:hover {
    background-color: ${({ theme }) => theme.color.muted};
  }
`;

/** A plain absolutely-positioned popover grid - place it inside a `position: relative` wrapper. */
export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  return (
    <Popover ref={ref} role="menu" aria-label="Choose an emoji">
      {EMOJIS.map((emoji, i) => (
        <EmojiButton
          key={`${emoji}-${i}`}
          type="button"
          onClick={() => onSelect(emoji)}
          aria-label={emoji}
        >
          {emoji}
        </EmojiButton>
      ))}
    </Popover>
  );
}
