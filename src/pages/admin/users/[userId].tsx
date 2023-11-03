import { type Prisma, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { db } from "~/server/db";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Layout from "../Layout";

type UserWithComments = Prisma.UserGetPayload<{
  include: {
    comments: true;
  };
}>;

type UserProps = {
  user: UserWithComments;
};

export default function UserPage({ user }: UserProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: mutateDeleteUser } = api.user.delete.useMutation({
    onSuccess: () => {
      refreshData();
    },
    onError: () => {
      console.log("Error while trying to delete comment");
    },
  });
  const { mutate: mutateToggleAdmin } = api.user.toggleAdmin.useMutation({
    onSuccess: () => {
      refreshData();
    },
    onError: () => {
      console.log("Error while trying to give admin to user");
    },
  });
  // Call this function whenever you want to
  // refresh props!
  const refreshData = () => {
    void router.replace(router.asPath);
  };

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }

  return (
    <Layout>
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <p>{user.name}</p>
        <p>{user.id}</p>
        <p>Total comments: {user.comments.length}</p>
        <div>
          {user.comments.map((comment) => (
            <p key={comment.id}>{comment.comment}</p>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<UserProps>> {
  if (!ctx.query?.userId || typeof ctx.query.userId !== "string") {
    return {
      notFound: true,
    };
  }

  const user = await db.user.findFirst({
    where: {
      id: ctx.query.userId,
    },
    include: {
      comments: true,
    },
  });
  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user,
    },
  };
}
