import AdminLayout from "./AdminLayout";
import { db } from "~/server/db";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next/types";
import StatsCard from "~/components/StatsCard";
import { checkAdminSession } from "~/server/helpers";

export type AdminProps = {
  counts: {
    usersCount: number;
    catsCount: number;
    litterCount: number;
    blogCount: number;
    catImagesCount: number;
    litterImagesCount: number;
    messageCount: number;
    commentsCount: number;
    visitsCount: number;
  };
};

export default function Admin({ counts }: AdminProps) {
  return (
    <AdminLayout>
      <StatsCard counts={counts} />
    </AdminLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  const [
    usersCount,
    catsCount,
    litterCount,
    blogCount,
    catImagesCount,
    litterImagesCount,
    messageCount,
    commentsCount,
    visitsCount,
  ] = await Promise.all([
    db.user.count(),
    db.cat.count(),
    db.litter.count(),
    db.blogPost.count(),
    db.catImage.count(),
    db.kittenPictureImage.count(),
    db.contactMessage.count(),
    db.comment.count(),
    db.counter.findFirst({
      select: {
        count: true,
      },
    }),
  ]);

  const counts = {
    usersCount,
    catsCount,
    litterCount,
    blogCount,
    catImagesCount,
    litterImagesCount,
    messageCount,
    commentsCount,
    visitsCount: visitsCount?.count ?? 0,
  };

  return {
    props: {
      counts,
    },
  };
}
