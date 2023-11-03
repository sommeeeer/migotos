import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";

import Layout from "./Layout";

export default function Users() {
  const { data: session, status } = useSession();

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }
  return <Layout>hi</Layout>;
}
