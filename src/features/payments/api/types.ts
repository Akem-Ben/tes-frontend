export type { Payment, PaymentStatus } from "@/shared/lib/mockStore";

export interface PaymentSummary {
  paid: number;
  partial: number;
  unpaid: number;
  totalDue: number;
  totalCollected: number;
}
