import type { ChatMessage, ChatRoom } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import type { NewMessage } from "./types";

export const listRoomsForFacilitator = (facilitatorId: string): ChatRoom[] =>
  getDb().chatRooms.filter((r) => r.facilitatorIds.includes(facilitatorId));

export const getRoom = (id: string): ChatRoom | undefined =>
  getDb().chatRooms.find((r) => r.id === id);

export const createRoom = (
  name: string,
  facilitatorIds: string[],
  createdBy: string,
): ChatRoom => {
  const room: ChatRoom = {
    id: uid("room"),
    name,
    facilitatorIds: Array.from(new Set([...facilitatorIds, createdBy])),
    createdBy,
    createdAt: new Date().toISOString(),
  };
  setDb((db) => ({ ...db, chatRooms: [...db.chatRooms, room] }));
  return room;
};

export const addFacilitatorToRoom = (
  roomId: string,
  facilitatorId: string,
): void =>
  setDb((db) => ({
    ...db,
    chatRooms: db.chatRooms.map((r) =>
      r.id === roomId && !r.facilitatorIds.includes(facilitatorId)
        ? { ...r, facilitatorIds: [...r.facilitatorIds, facilitatorId] }
        : r,
    ),
  }));

export const removeFacilitatorFromRoom = (
  roomId: string,
  facilitatorId: string,
): void =>
  setDb((db) => ({
    ...db,
    chatRooms: db.chatRooms.map((r) =>
      r.id === roomId
        ? {
            ...r,
            facilitatorIds: r.facilitatorIds.filter((f) => f !== facilitatorId),
          }
        : r,
    ),
  }));

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
