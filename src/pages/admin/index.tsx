import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import Layout from "./Layout";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { db } from "~/server/db";
import type { GetServerSidePropsResult } from "next/types";
import StatsCard from "~/components/StatsCard";

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
  };
};

export default function Admin({ counts }: AdminProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Layout>
        <LoadingSpinner className="h-12 w-12" />
      </Layout>
    );
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized. You cant access this page.</div>;
  }
  return (
    <Layout>
      <StatsCard counts={counts} />
    </Layout>
  );
}

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<AdminProps>
> {
  const [
    usersCount,
    catsCount,
    litterCount,
    blogCount,
    catImagesCount,
    litterImagesCount,
    messageCount,
    commentsCount,
  ] = await Promise.all([
    db.user.count(),
    db.cat.count(),
    db.litter.count(),
    db.blogPost.count(),
    db.catImage.count(),
    db.kittenPictureImage.count(),
    db.contactMessage.count(),
    db.comment.count(),
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
  };

  return {
    props: {
      counts,
    },
  };
}
