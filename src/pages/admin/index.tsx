import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { db } from "~/server/db";

export default function Admin() {
  const { data: session, status } = useSession();

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }
  return (
    <div>
      logged in as {session.user.name} you are {session.user.role}
    </div>
  );
}
