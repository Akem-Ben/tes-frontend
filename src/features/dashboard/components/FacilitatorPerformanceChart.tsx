import "./chartSetup";
import { Bar } from "react-chartjs-2";
import { useTheme } from "styled-components";
import type { FacilitatorPerformance } from "@/features/analytics";

export function FacilitatorPerformanceChart({
  rows,
}: {
  rows: FacilitatorPerformance[];
}) {
  const theme = useTheme();

  return (
    <Bar
      data={{
        labels: rows.map((r) => r.facilitatorName),
        datasets: [
          {
            label: "Attendance %",
            data: rows.map((r) => r.averages.attendance),
            backgroundColor: theme.color.brand,
          },
          {
            label: "Submissions %",
            data: rows.map((r) => r.averages.submissions),
            backgroundColor: theme.bar.amber,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { labels: { color: theme.color.textBody } } },
        scales: {
          x: {
            ticks: { color: theme.color.textMuted },
            grid: { display: false },
          },
          y: {
            ticks: { color: theme.color.textMuted },
            min: 0,
            max: 100,
            grid: { color: theme.color.border },
          },
        },
      }}
    />
  );
}
