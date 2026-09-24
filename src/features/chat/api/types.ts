export type { ChatRoom, ChatMessage } from "@/shared/lib/mockStore";

export interface NewMessage {
  roomId: string;
  senderId: string;
  text: string;
  replyToId?: string | undefined;
  sharedFeedbackId?: string | undefined;
}
