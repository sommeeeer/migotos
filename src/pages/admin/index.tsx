import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next/types';
import { UAParser } from 'ua-parser-js';

import AdminLayout from './AdminLayout';
import StatsCard from '~/components/StatsCard';
import { checkAdminSession } from '~/server/helpers';
import { db } from '~/server/db';

export type AdminProps = {
  counts: {
    usersCount: number;
    catsCount: number;
    litterCount: number;
    kittensCount: number;
    blogCount: number;
    catImagesCount: number;
    litterImagesCount: number;
    messageCount: number;
    commentsCount: number;
    visitsCount: number;
    mobilePercentage: number;
    desktopPercentage: number;
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
  ctx: GetServerSidePropsContext
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
    kittensCount,
    blogCount,
    catImagesCount,
    litterImagesCount,
    messageCount,
    commentsCount,
    visitsCount,
    visitors,
  ] = await Promise.all([
    db.user.count(),
    db.cat.count(),
    db.litter.count(),
    db.kitten.count(),
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
    db.visitor.findMany({
      select: {
        ua: true,
      },
      where: {
        bot: false,
      },
    }),
  ]);

  const isDesktop = (ua: string) => {
    return UAParser(ua).device.type === undefined;
  };

  const mobileCount = visitors.filter((v) => {
    return UAParser(v.ua).device.type === 'mobile';
  }).length;
  const desktopCount = visitors.filter((v) => isDesktop(v.ua)).length;

  const mobilePercentage = (mobileCount / visitors.length) * 100;
  const desktopPercentage = (desktopCount / visitors.length) * 100;

  const counts = {
    usersCount,
    catsCount,
    litterCount,
    kittensCount,
    blogCount,
    catImagesCount,
    litterImagesCount,
    messageCount,
    commentsCount,
    visitsCount: visitsCount?.count ?? 0,
    mobilePercentage,
    desktopPercentage,
  };

  return {
    props: {
      counts,
    },
  };
}
