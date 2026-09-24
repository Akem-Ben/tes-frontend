import type { WaitingList } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";

export const listWaitingLists = (): WaitingList[] => getDb().waitingLists;

export const getWaitingList = (id: string): WaitingList | undefined =>
  getDb().waitingLists.find((w) => w.id === id);

export const createWaitingList = (name: string): WaitingList => {
  const waitingList: WaitingList = {
    id: uid("wl"),
    name,
    facilitatorIds: [],
    studentIds: [],
  };
  setDb((db) => ({ ...db, waitingLists: [...db.waitingLists, waitingList] }));
  return waitingList;
};

export const addFacilitatorToWaitingList = (
  id: string,
  facilitatorId: string,
): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.map((w) =>
      w.id === id && !w.facilitatorIds.includes(facilitatorId)
        ? { ...w, facilitatorIds: [...w.facilitatorIds, facilitatorId] }
        : w,
    ),
  }));

export const removeFacilitatorFromWaitingList = (
  id: string,
  facilitatorId: string,
): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.map((w) =>
      w.id === id
        ? {
            ...w,
            facilitatorIds: w.facilitatorIds.filter((f) => f !== facilitatorId),
          }
        : w,
    ),
  }));

export const addStudentToWaitingList = (id: string, studentId: string): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.map((w) =>
      w.id === id && !w.studentIds.includes(studentId)
        ? { ...w, studentIds: [...w.studentIds, studentId] }
        : w,
    ),
  }));

export const removeStudentFromWaitingList = (
  id: string,
  studentId: string,
): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.map((w) =>
      w.id === id
        ? { ...w, studentIds: w.studentIds.filter((s) => s !== studentId) }
        : w,
    ),
  }));

/** Removes a student from every waiting list they're in (used when they're placed elsewhere). */
export const removeStudentFromAllWaitingLists = (studentId: string): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.map((w) => ({
      ...w,
      studentIds: w.studentIds.filter((s) => s !== studentId),
    })),
  }));

export const deleteWaitingList = (id: string): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.filter((w) => w.id !== id),
  }));
