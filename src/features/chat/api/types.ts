export type {
  ChatRoom,
  ChatMessage,
  ChatMemberRole,
  ChatReaction,
} from "@/shared/lib/mockStore";
import type { ChatMemberRole } from "@/shared/lib/mockStore";

export interface NewMessage {
  roomId: string;
  senderId: string;
  senderRole: ChatMemberRole;
  text: string;
  replyToId?: string | undefined;
  sharedFeedbackId?: string | undefined;
}

/** Everyone a room can have as a member - students are tagged only, never senders. */
export type ChatMemberType = "facilitator" | "admin" | "student";

export interface ChatSearchResult {
  id: string;
  type: ChatMemberType;
  name: string;
  /** Email for facilitators/admins, registration number for students - shown to disambiguate. */
  meta: string;
}
