
import dayjs from "dayjs";

export const startOfToday = () => dayjs().startOf("day").toDate();
export const nowDayjs = () => dayjs();



export type Range = "today" | "week" | "month" | "year";

export function getRangeDates(range: Range) {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week": {
      const day = now.getDay(); // 0=Sun
      const diff = (day === 0 ? -6 : 1) - day; // start Monday
      start.setDate(now.getDate() + diff);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end: now };
}
