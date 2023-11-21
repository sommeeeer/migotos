import { Role } from "@prisma/client";
import { parseISO, format } from "date-fns";
import { GetServerSidePropsContext } from "next/types";
import { getServerAuthSession } from "~/server/auth";

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
  const image = await fetch(uploadUrl, {
    body: file,
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${file.name}"`,
    },
  });
  return image;
}

export async function checkAdminSession(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  return session;
}
