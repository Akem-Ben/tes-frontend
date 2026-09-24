import type { Group } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { getDb, setDb } from "@/shared/lib/mockStore";

export const listGroups = (facilitatorId: string): Group[] =>
  getDb().groups.filter((g) => g.facilitatorIds.includes(facilitatorId));

/** Every group across every facilitator - for president/admin cross-facilitator views. */
export const listAllGroups = (): Group[] => getDb().groups;

export const getGroup = (id: string): Group | undefined =>
  getDb().groups.find((g) => g.id === id);

export const getGroupByCohort = (cohortId: string): Group | undefined =>
  getDb().groups.find((g) => g.cohortId === cohortId);

export const createGroup = (
  name: string,
  cohortId: string,
  facilitatorIds: string[],
): Group => {
  const db = getDb();
  const group: Group = {
    id: uid("grp"),
    name,
    cohortId,
    facilitatorIds,
    sequence: db.groups.length + 1,
    isActive: true,
  };
  setDb((current) => ({ ...current, groups: [...current.groups, group] }));
  return group;
};

export const updateGroup = (id: string, patch: Partial<Group>): void =>
  setDb((db) => ({
    ...db,
    groups: db.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  }));

export const addFacilitator = (groupId: string, facilitatorId: string): void =>
  setDb((db) => ({
    ...db,
    groups: db.groups.map((g) =>
      g.id === groupId && !g.facilitatorIds.includes(facilitatorId)
        ? { ...g, facilitatorIds: [...g.facilitatorIds, facilitatorId] }
        : g,
    ),
  }));

export const removeFacilitator = (
  groupId: string,
  facilitatorId: string,
): void =>
  setDb((db) => ({
    ...db,
    groups: db.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            facilitatorIds: g.facilitatorIds.filter((f) => f !== facilitatorId),
          }
        : g,
    ),
  }));

export const deleteGroup = (id: string): void =>
  setDb((db) => ({ ...db, groups: db.groups.filter((g) => g.id !== id) }));
