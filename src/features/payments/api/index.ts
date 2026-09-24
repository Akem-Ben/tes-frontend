import type { Payment, PaymentStatus } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { currentWeekKey } from "@/shared/lib/date";
import { uid } from "@/shared/lib/format";
import type { PaymentSummary } from "./types";

/** Ensures every active student has a payment row for the current period (admin-only feature). */
export const ensureCurrentPeriodPayments = (amountDue = 1000): void => {
  const period = currentWeekKey();
  setDb((db) => {
    const existingKeys = new Set(
      db.payments.filter((p) => p.period === period).map((p) => p.studentId),
    );
    const additions: Payment[] = db.students
      .filter((s) => s.isActive && !existingKeys.has(s.id) && s.groupIds[0])
      .map((s) => ({
        id: uid("pay"),
        studentId: s.id,
        groupId: s.groupIds[0]!,
        period,
        amountDue,
        amountPaid: 0,
        status: "unpaid",
      }));
    return additions.length > 0
      ? { ...db, payments: [...db.payments, ...additions] }
      : db;
  });
};

export const listPayments = (period?: string): Payment[] => {
  const db = getDb();
  return period ? db.payments.filter((p) => p.period === period) : db.payments;
};

export const setPayment = (id: string, amountPaid: number): void =>
  setDb((db) => ({
    ...db,
    payments: db.payments.map((p) => {
      if (p.id !== id) return p;
      const status: PaymentStatus =
        amountPaid <= 0
          ? "unpaid"
          : amountPaid >= p.amountDue
            ? "paid"
            : "partial";
      return { ...p, amountPaid, status };
    }),
  }));

export const paymentSummary = (payments: Payment[]): PaymentSummary => ({
  paid: payments.filter((p) => p.status === "paid").length,
  partial: payments.filter((p) => p.status === "partial").length,
  unpaid: payments.filter((p) => p.status === "unpaid").length,
  totalDue: payments.reduce((sum, p) => sum + p.amountDue, 0),
  totalCollected: payments.reduce((sum, p) => sum + p.amountPaid, 0),
});
