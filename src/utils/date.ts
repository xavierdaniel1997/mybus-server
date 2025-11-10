
import dayjs from "dayjs";

export const startOfToday = () => dayjs().startOf("day").toDate();
export const nowDayjs = () => dayjs();
