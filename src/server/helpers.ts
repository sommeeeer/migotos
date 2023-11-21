import { type GetServerSidePropsContext } from "next/types";
import { getServerAuthSession } from "~/server/auth";
import { Role } from "@prisma/client";

export async function checkAdminSession(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  return session;
}
