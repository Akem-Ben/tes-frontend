import "./chartSetup";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "styled-components";
import type { PaymentSummary } from "@/features/payments";

export function PaymentStatusChart({ summary }: { summary: PaymentSummary }) {
  const theme = useTheme();

  return (
    <Doughnut
      data={{
        labels: ["Paid", "Partial", "Unpaid"],
        datasets: [
          {
            data: [summary.paid, summary.partial, summary.unpaid],
            backgroundColor: [theme.bar.green, theme.bar.amber, theme.bar.red],
            borderWidth: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: theme.color.textBody },
          },
        },
      }}
    />
  );
}
