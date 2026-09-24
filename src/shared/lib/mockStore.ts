/**
 * There is no backend yet, so this tiny localStorage-backed store plays that role:
 * every feature's `api/index.ts` reads/writes through here, exactly like a real
 * API would read/write through a database. Row shapes are defined here (the
 * "schema") and re-exported from each feature's `api/types.ts` for consumers.
 */
import { useSyncExternalStore } from "react";

export type Role = "admin" | "president" | "facilitator" | "superadmin";

/**
 * A super admin is an Admin row with `isSuperAdmin: true` - not a separate account table. They log in
 * through the exact same admin login form; `login()` in `features/auth/api` computes the effective
 * role from this flag. A super admin sees everything a president sees, everything an admin sees, and
 * everything every individual facilitator sees.
 */
export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  photo?: string | undefined;
  isSuperAdmin?: boolean | undefined;
}

export interface President {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  photo?: string | undefined;
}

export interface Facilitator {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  hoursOfPriesthood: number;
  ordinationDate: string; // ISO date
  photo?: string | undefined;
}

export type CohortStatus = "active" | "closed";

/**
 * A cohort is the intake batch for its students: admin moves students
 * into it from a waiting list via `studentIds`, and facilitators then place students from
 * that pool into one of the cohort's groups. Not every cohort has an owning facilitator -
 * admin can create an org-wide cohort directly.
 */
export interface Cohort {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  facilitatorId?: string | undefined;
  status: CohortStatus;
  /** Students placed in this cohort but not yet in one of its groups. */
  studentIds: string[];
}

export interface Group {
  id: string;
  name: string;
  cohortId: string;
  /** A group may have several facilitators, all with equal permissions. */
  facilitatorIds: string[];
  /** Sequence used to build student registration numbers (TES-G3-0001). */
  sequence: number;
  isActive: boolean;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  registrationNumber: string;
  /** A student may belong to several groups, but never two groups in the same cohort. */
  groupIds: string[];
  /** Daily priesthood hour, "HH:MM" 24h - when the sign-in window opens. */
  hourOfPriesthood?: string | undefined;
  /** "HH:MM" 24h - when the sign-in window closes. Defaults to +60 minutes. */
  hourOfPriesthoodEnd?: string | undefined;
  dateJoined: string; // ISO date
  photo?: string | undefined;
  isActive: boolean;
}

export interface SignInOut {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  signedIn: boolean;
  timeIn?: string | undefined; // HH:MM
  signedOut: boolean;
  timeOut?: string | undefined; // HH:MM
}

/** Everything that runs on a weekly cycle repeats "weekly" or happens "none" (once). */
export type Recurrence = "none" | "weekly";

export interface AttendanceEvent {
  id: string;
  name: string;
  type: string; // free text: "Prayer Meeting", "Class", custom...
  groupId: string;
  date: string; // ISO datetime
  recurrence: Recurrence;
  studentIds: string[];
  /** Links recurring instances of the same event together. */
  seriesId: string;
  /** Set once a facilitator/president/admin locks the week - blocks further edits. */
  finishedAt?: string | undefined;
}

export interface AttendanceRecord {
  id: string;
  attendanceEventId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  attended: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  type: string; // free text: "Message Review", "Book Review", custom...
  groupId: string;
  dueDate: string; // ISO date
  description?: string | undefined;
  studentIds: string[];
  recurrence: Recurrence;
  seriesId: string;
  finishedAt?: string | undefined;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submitted: boolean;
  dateSubmitted?: string | undefined;
  grade?: string | undefined;
  notes?: string | undefined;
}

export type PaymentStatus = "paid" | "partial" | "unpaid";

export interface Payment {
  id: string;
  studentId: string;
  groupId: string;
  /** Week key, e.g. "2026-W08". */
  period: string;
  amountDue: number;
  amountPaid: number;
  status: PaymentStatus;
  note?: string | undefined;
}

export interface RetreatEvent {
  id: string;
  name: string;
  groupId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  description?: string | undefined;
  studentIds: string[];
  finishedAt?: string | undefined;
}

export interface RetreatAttendance {
  id: string;
  retreatId: string;
  studentId: string;
  attended: boolean;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  active: boolean;
}

/**
 * A holding pool for students not yet placed in a group. "Like a group" - it can have
 * facilitators assigned to it - but it isn't tied to a cohort, and every facilitator
 * (not just the assigned ones) can manage its membership.
 */
export interface WaitingList {
  id: string;
  name: string;
  facilitatorIds: string[];
  studentIds: string[];
}

/** A standing weekly slot for a group (e.g. "Doctrine Class, every Tuesday at 16:00"). */
export interface WeeklyClass {
  id: string;
  name: string;
  groupId: string;
  /** 0 = Sunday ... 6 = Saturday. */
  dayOfWeek: number;
  time: string; // HH:MM 24h
  description?: string | undefined;
  studentIds: string[];
  isActive: boolean;
}

export interface WeeklyClassAttendance {
  id: string;
  weeklyClassId: string;
  studentId: string;
  date: string; // YYYY-MM-DD, the specific week's occurrence
  attended: boolean;
}

/** Feedback a student has given, logged by their facilitator. */
export interface Feedback {
  id: string;
  studentId: string;
  groupId: string;
  facilitatorId: string;
  date: string; // ISO date the feedback was given
  message: string;
  createdAt: string; // ISO datetime the record was entered
}

/** Who a chat member/sender id refers to. Students have no login - they're tagged, never senders. */
export type ChatMemberRole = "facilitator" | "admin";

export interface ChatRoom {
  id: string;
  name: string;
  facilitatorIds: string[];
  /** Admins (including super admins) can be full members too - added by a facilitator or another admin. */
  adminIds: string[];
  /** Students tagged into the room for context - not senders, just referenced/visible members. */
  studentIds: string[];
  createdBy: string;
  createdByRole: ChatMemberRole;
  createdAt: string; // ISO datetime
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: ChatMemberRole;
  text: string;
  createdAt: string; // ISO datetime
  replyToId?: string | undefined;
  sharedFeedbackId?: string | undefined;
}

/** One person's reaction to one message. Reacting again with the same emoji removes it (toggle). */
export interface ChatReaction {
  id: string;
  messageId: string;
  memberId: string;
  memberRole: ChatMemberRole;
  emoji: string;
}

export interface Database {
  admins: Admin[];
  presidents: President[];
  facilitators: Facilitator[];
  cohorts: Cohort[];
  groups: Group[];
  students: Student[];
  signInOuts: SignInOut[];
  attendanceEvents: AttendanceEvent[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  payments: Payment[];
  retreats: RetreatEvent[];
  retreatAttendance: RetreatAttendance[];
  weeklyClasses: WeeklyClass[];
  weeklyClassAttendance: WeeklyClassAttendance[];
  feedback: Feedback[];
  chatRooms: ChatRoom[];
  chatMessages: ChatMessage[];
  chatReactions: ChatReaction[];
  waitingLists: WaitingList[];
  quotes: Quote[];
}

const KEY = "tesms.db.v7";

/** Every top-level collection the current schema expects - used to detect stale/partial data. */
const REQUIRED_COLLECTIONS: Array<keyof Database> = [
  "admins",
  "presidents",
  "facilitators",
  "cohorts",
  "groups",
  "students",
  "signInOuts",
  "attendanceEvents",
  "attendanceRecords",
  "assignments",
  "submissions",
  "payments",
  "retreats",
  "retreatAttendance",
  "weeklyClasses",
  "weeklyClassAttendance",
  "feedback",
  "chatRooms",
  "chatMessages",
  "chatReactions",
  "waitingLists",
  "quotes",
];

/**
 * A previous build's cached data (a different shape of `Database`, or - since the schema
 * key isn't versioned per-field - a same-key blob missing newer collections/fields) would
 * otherwise parse "successfully" as JSON and silently break every reader that expects the
 * current shape. Reject anything that doesn't look like the current schema instead.
 */
const isValidDatabase = (value: unknown): value is Database => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (!REQUIRED_COLLECTIONS.every((key) => Array.isArray(candidate[key])))
    return false;
  const students = candidate["students"] as unknown[];
  if (
    !students.every((s) =>
      Array.isArray((s as { groupIds?: unknown }).groupIds),
    )
  )
    return false;
  const cohorts = candidate["cohorts"] as unknown[];
  return cohorts.every((s) =>
    Array.isArray((s as { studentIds?: unknown }).studentIds),
  );
};

let db: Database | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = (): void => listeners.forEach((l) => l());

export const hydrate = (): void => {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      db = isValidDatabase(parsed) ? parsed : null;
    } catch {
      db = null;
    }
  }
  if (!db) db = seedDatabase();
  emit();
};

let seedDatabase: () => Database = () => {
  throw new Error("mockStore.setSeeder() must be called before hydrate().");
};

/** Lets seed.ts (which imports these types) provide the seeding function without a cycle. */
export const setSeeder = (fn: () => Database): void => {
  seedDatabase = fn;
};

export const getDb = (): Database => {
  if (!db) db = seedDatabase();
  return db;
};

export const setDb = (updater: (current: Database) => Database): void => {
  db = updater(getDb());
  if (typeof window !== "undefined")
    window.localStorage.setItem(KEY, JSON.stringify(db));
  emit();
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Reactive read of the database - re-renders the caller whenever any part of it changes. */
export const useDb = (): Database =>
  useSyncExternalStore(subscribe, getDb, getDb);

export const resetDb = (): void => setDb(() => seedDatabase());
