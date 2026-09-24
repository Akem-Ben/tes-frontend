import type {
  ChatMemberRole,
  ChatMessage,
  ChatReaction,
  ChatRoom,
} from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import type { ChatMemberType, ChatSearchResult, NewMessage } from "./types";

const isMemberOf = (room: ChatRoom, memberId: string, role: ChatMemberRole) =>
  role === "admin"
    ? room.adminIds.includes(memberId)
    : room.facilitatorIds.includes(memberId);

export const listRoomsForMember = (
  memberId: string,
  role: ChatMemberRole,
): ChatRoom[] => getDb().chatRooms.filter((r) => isMemberOf(r, memberId, role));

/** Every room in the org - super admin oversight, not scoped to membership. */
export const listAllRooms = (): ChatRoom[] => getDb().chatRooms;

export const getRoom = (id: string): ChatRoom | undefined =>
  getDb().chatRooms.find((r) => r.id === id);

export const createRoom = (input: {
  name: string;
  facilitatorIds: string[];
  adminIds: string[];
  studentIds: string[];
  createdBy: string;
  createdByRole: ChatMemberRole;
}): ChatRoom => {
  const room: ChatRoom = {
    id: uid("room"),
    name: input.name,
    facilitatorIds:
      input.createdByRole === "facilitator"
        ? Array.from(new Set([...input.facilitatorIds, input.createdBy]))
        : Array.from(new Set(input.facilitatorIds)),
    adminIds:
      input.createdByRole === "admin"
        ? Array.from(new Set([...input.adminIds, input.createdBy]))
        : Array.from(new Set(input.adminIds)),
    studentIds: Array.from(new Set(input.studentIds)),
    createdBy: input.createdBy,
    createdByRole: input.createdByRole,
    createdAt: new Date().toISOString(),
  };
  setDb((db) => ({ ...db, chatRooms: [...db.chatRooms, room] }));
  return room;
};

export const addMemberToRoom = (
  roomId: string,
  memberType: ChatMemberType,
  memberId: string,
): void =>
  setDb((db) => ({
    ...db,
    chatRooms: db.chatRooms.map((r) => {
      if (r.id !== roomId) return r;
      if (memberType === "facilitator")
        return r.facilitatorIds.includes(memberId)
          ? r
          : { ...r, facilitatorIds: [...r.facilitatorIds, memberId] };
      if (memberType === "admin")
        return r.adminIds.includes(memberId)
          ? r
          : { ...r, adminIds: [...r.adminIds, memberId] };
      return r.studentIds.includes(memberId)
        ? r
        : { ...r, studentIds: [...r.studentIds, memberId] };
    }),
  }));

export const removeMemberFromRoom = (
  roomId: string,
  memberType: ChatMemberType,
  memberId: string,
): void =>
  setDb((db) => ({
    ...db,
    chatRooms: db.chatRooms.map((r) => {
      if (r.id !== roomId) return r;
      if (memberType === "facilitator")
        return {
          ...r,
          facilitatorIds: r.facilitatorIds.filter((id) => id !== memberId),
        };
      if (memberType === "admin")
        return { ...r, adminIds: r.adminIds.filter((id) => id !== memberId) };
      return { ...r, studentIds: r.studentIds.filter((id) => id !== memberId) };
    }),
  }));

/** Search across facilitators/admins/students by name (or email) - backs the "add member" modal. */
export const searchMembers = (
  query: string,
  types: ChatMemberType[] = ["facilitator", "admin", "student"],
): ChatSearchResult[] => {
  const db = getDb();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: ChatSearchResult[] = [];
  if (types.includes("facilitator")) {
    db.facilitators
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q),
      )
      .forEach((f) =>
        results.push({
          id: f.id,
          type: "facilitator",
          name: f.name,
          meta: f.email,
        }),
      );
  }
  if (types.includes("admin")) {
    db.admins
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
      )
      .forEach((a) =>
        results.push({
          id: a.id,
          type: "admin",
          name: a.isSuperAdmin ? `${a.name} (Super Admin)` : a.name,
          meta: a.email,
        }),
      );
  }
  if (types.includes("student")) {
    db.students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.registrationNumber.toLowerCase().includes(q),
      )
      .forEach((s) =>
        results.push({
          id: s.id,
          type: "student",
          name: s.name,
          meta: s.registrationNumber,
        }),
      );
  }
  return results.slice(0, 20);
};

export const listMessages = (roomId: string): ChatMessage[] =>
  getDb()
    .chatMessages.filter((m) => m.roomId === roomId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const sendMessage = (input: NewMessage): ChatMessage => {
  const message: ChatMessage = {
    ...input,
    id: uid("msg"),
    createdAt: new Date().toISOString(),
  };
  setDb((db) => ({ ...db, chatMessages: [...db.chatMessages, message] }));
  return message;
};

export const listReactions = (messageId: string): ChatReaction[] =>
  getDb().chatReactions.filter((r) => r.messageId === messageId);

/** Reacting again with the same emoji removes it - a toggle, one row per (message, member, emoji). */
export const toggleReaction = (
  messageId: string,
  memberId: string,
  memberRole: ChatMemberRole,
  emoji: string,
): void =>
  setDb((db) => {
    const existing = db.chatReactions.find(
      (r) =>
        r.messageId === messageId &&
        r.memberId === memberId &&
        r.memberRole === memberRole &&
        r.emoji === emoji,
    );
    if (existing) {
      return {
        ...db,
        chatReactions: db.chatReactions.filter((r) => r.id !== existing.id),
      };
    }
    const reaction: ChatReaction = {
      id: uid("rxn"),
      messageId,
      memberId,
      memberRole,
      emoji,
    };
    return { ...db, chatReactions: [...db.chatReactions, reaction] };
  });
