import { parseISO, format } from "date-fns";
import crypto from "crypto";

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

export async function uploadS3(file: File, uploadUrl: string) {
  try {
    const image = await fetch(uploadUrl, {
      body: file,
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });
    return image.url.split("?")[0];
  } catch (error) {
    throw new Error("Error uploading image");
  }
}

export function bytesToMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

export function createGravatarURL(
  email: string | undefined,
  size = 32,
): string {
  if (!email) {
    return `https://www.gravatar.com/avatar/?d=mp&size=${size}`;
  }
  const hash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&size=${size}`;
}

