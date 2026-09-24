import type { Facilitator } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { todayISO } from "@/shared/lib/date";
import type { NewFacilitator } from "./types";

export const listFacilitators = (): Facilitator[] => getDb().facilitators;

export const getFacilitator = (id: string): Facilitator | undefined =>
  getDb().facilitators.find((f) => f.id === id);

export const searchFacilitators = (query: string): Facilitator[] => {
  const q = query.trim().toLowerCase();
  if (!q) return getDb().facilitators;
  return getDb().facilitators.filter(
    (f) =>
      f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q),
  );
};

/** Added by an admin or the president. */
export const createFacilitator = (input: NewFacilitator): Facilitator => {
  const facilitator: Facilitator = {
    id: uid("fac"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password: input.password,
    hoursOfPriesthood: 0,
    ordinationDate: todayISO(),
  };
  setDb((db) => ({ ...db, facilitators: [...db.facilitators, facilitator] }));
  return facilitator;
};
