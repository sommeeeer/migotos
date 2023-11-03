import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";

import Layout from "./Layout";
import LoadingSpinner from "~/components/ui/LoadingSpinner";

export default function Admin() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Layout><LoadingSpinner className="h-12 w-12" /></Layout>;
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized. You can't access this page.</div>;
  }
  return <Layout>hi</Layout>;
}
