export const percent = (part: number, total: number): number =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export const initials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

export const uid = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

/** e.g. TES-G3-0001 */
export const registrationNumber = (
  groupSequence: number,
  studentIndex: number,
): string => `TES-G${groupSequence}-${String(studentIndex).padStart(4, "0")}`;
