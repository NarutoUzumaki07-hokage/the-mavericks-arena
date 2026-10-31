/**
 * SAMPLE DATA — placeholders shown until learning tracking is built.
 * Nothing here comes from the database.
 */
export const SAMPLE = {
  streakDays: 0,
  focusedMinutesToday: 0,
} as const;

export function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
