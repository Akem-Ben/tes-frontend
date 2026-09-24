import { getDb, hydrate } from "@/shared/lib/mockStore";
import type { AuthState } from "./types";
import type { Database, Role } from "@/shared/lib/mockStore";

const KEY = "tesms.auth.v1";

export const emptyAuth: AuthState = { user: null, role: null };

const roleCollection = (role: Role, db: Database) =>
  role === "admin"
    ? db.admins
    : role === "president"
      ? db.presidents
      : db.facilitators;

/** Same "endpoint" for every role; the role decides which collection is checked. */
export const login = (
  role: Role,
  email: string,
  password: string,
): AuthState => {
  hydrate();
  const db = getDb();
  const found = roleCollection(role, db).find(
    (a) =>
      a.email.toLowerCase() === email.trim().toLowerCase() &&
      a.password === password,
  );
  if (!found) throw new Error("Incorrect email or password for this role.");
  return {
    user: {
      id: found.id,
      name: found.name,
      email: found.email,
      photo: found.photo,
    },
    role,
  };
};

export const saveAuth = (state: AuthState): void => {
  if (typeof window !== "undefined")
    window.localStorage.setItem(KEY, JSON.stringify(state));
};

export const loadAuth = (): AuthState => {
  if (typeof window === "undefined") return emptyAuth;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return emptyAuth;
  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed.role || !parsed.user?.id) return emptyAuth;
    return parsed;
  } catch {
    return emptyAuth;
  }
};

export const clearAuth = (): void => {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
};

/**
 * A cached session can outlive the account it points to - e.g. a demo database that gets
 * reset or reseeded with different accounts. Call this once the store is hydrated and drop
 * the session rather than let a dangling id flow through the rest of the app as "logged in".
 */
export const verifyAuth = (state: AuthState): AuthState => {
  const { role, user } = state;
  if (!role || !user) return emptyAuth;
  const exists = roleCollection(role, getDb()).some((a) => a.id === user.id);
  return exists ? state : emptyAuth;
};
