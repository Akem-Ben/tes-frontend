import { Badge } from "@/shared/ui";
import type { PaymentStatus } from "../api/types";

const TONE: Record<PaymentStatus, "green" | "amber" | "red"> = {
  paid: "green",
  partial: "amber",
  unpaid: "red",
};

const LABEL: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
