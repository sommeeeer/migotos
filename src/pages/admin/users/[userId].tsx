import { type Prisma } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { db } from "~/server/db";
import { useRouter } from "next/router";
import Layout from "../Layout";
import Link from "next/link";
import { FaComments } from "react-icons/fa";
import { checkAdminSession } from "~/server/helpers";
import { Button } from "~/components/ui/button";

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

  return (
    <Layout>
      <div className="mb-4 flex flex-col gap-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl">
          {user.name} - (id: {user.id})
        </h1>
        <div className="relative flex items-center gap-2 self-start border-b-2 border-b-gray-200">
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
      <Button onClick={() => router.back()}>Go back</Button>
    </Layout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<UserProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

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
