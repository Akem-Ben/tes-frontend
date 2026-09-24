/** Breakpoint helpers used inside styled-components template literals. */
export const media = {
  sm: "@media (min-width: 640px)",
  lg: "@media (min-width: 1024px)",
  maxLg: "@media (max-width: 1023px)",
} as const;
