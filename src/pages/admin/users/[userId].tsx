import { type Prisma, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { db } from "~/server/db";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Layout from "../Layout";
import Link from "next/link";
import { FaComments } from "react-icons/fa";

type UserWithComments = Prisma.UserGetPayload<{
  include: {
    comments: {
      include: {
        Post: true;
        Cat: true;
        Litter: true;
      };
    };
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
  console.log(user.comments);

  return (
    <Layout>
      <div className="mb-4 flex flex-col gap-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl">
          {user.name} - (id: {user.id})
        </h1>
        <div className="relative flex items-center gap-2 border-b-2 border-b-gray-200 self-start">
          <p className="mb-2 py-2 text-xl">
            Total comments: {user.comments.length}
          </p>
          <FaComments className="relative top-[-4px]" size={"1.5rem"} />
        </div>
        <div className="flex flex-col gap-6">
          {user.comments.map((comment) => (
            <div key={comment.id}>
              <Link
                href={
                  comment.Litter
                    ? `/kittens/${comment.Litter.slug}`
                    : comment.Cat
                    ? `/cats/${comment.Cat.slug}`
                    : comment.Post
                    ? `/news/${comment.Post.id}`
                    : ""
                }
              >
                <span className="text-lg italic">
                  {comment.Post?.title ??
                    comment.Cat?.name ??
                    comment.Litter?.name}
                </span>
              </Link>
              <div className="relative w-fit self-start rounded-lg bg-gray-100 px-3 py-3">
                <p className="whitespace-normal break-words text-base">
                  {comment.comment}
                </p>
              </div>
            </div>
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
      comments: {
        include: {
          Post: true,
          Cat: true,
          Litter: true,
        },
      },
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
