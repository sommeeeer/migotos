import type { Prisma } from "@prisma/client";

import { db } from "~/server/db";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next/types";
import { checkAdminSession } from "~/server/helpers";
import AdminLayout from "../../AdminLayout";

type CatWithImage = Prisma.CatGetPayload<{
  include: {
    CatImage: true;
  };
}>;

type EditCatImages = {
  cat: CatWithImage;
};

export default function EditCatImages({ cat }: EditCatImages) {
  return <AdminLayout>hi</AdminLayout>;
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EditCatImages>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  if (!ctx.query?.id || typeof ctx.query.id !== "string") {
    return {
      notFound: true,
    };
  }

  const cat = await db.cat.findFirst({
    where: {
      id: +ctx.query.id,
    },
    include: {
      CatImage: true,
    },
  });
  if (!cat) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      cat,
    },
  };
}
