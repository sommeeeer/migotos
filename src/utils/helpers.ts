import { parseISO, format } from "date-fns";

export function formatDate(inputDate: string) {
  const date = parseISO(inputDate);
  const day = format(date, "do");
  const monthYear = format(date, "MMMM yyyy");
  const formattedDay = day;
  return `BORN ${formattedDay} OF ${monthYear.toUpperCase()}`;
}

export function findName(name: string) {
  return name
    .replaceAll(",", "")
    .split(" ")
    .filter((w) => {
      if (w.length > 3 && /^[a-zA-Z]+$/.test(w)) {
        return w;
      }
    });
}

export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}
