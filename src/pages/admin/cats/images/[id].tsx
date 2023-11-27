import type { Prisma } from "@prisma/client";

import { db } from "~/server/db";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next/types";
import { checkAdminSession } from "~/server/helpers";
import AdminLayout from "../../AdminLayout";
import Image from "next/image";
import { Button } from "~/components/ui/button";

type CatWithImage = Prisma.CatGetPayload<{
  include: {
    CatImage: true;
  };
}>;

type EditCatImages = {
  cat: CatWithImage;
};

export default function EditCatImages({ cat }: EditCatImages) {
  console.log(cat);
  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-xl border-2 p-4 text-center">
          <h1 className="text-xl text-gray-800">Photos for {cat.name}</h1>
          <Button className="w-fit mx-auto">Add more photos</Button>
        </div>
        <section className="flex flex-col items-center gap-2">
          {cat.CatImage.map((catimage) => (
            <div
              className="flex cursor-grab items-center gap-2"
              key={catimage.id}
            >
              <span className="select-none text-xl">
                {catimage.priority ? catimage.priority - 1 : ""}
              </span>
              <Image
                width={catimage.width}
                height={catimage.height}
                className="h-auto w-[200px]"
                src={catimage.src}
                alt={`${cat.name}'s photo number ${cat.id}`}
              />
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
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
      CatImage: {
        where: {
          priority: {
            gt: 1,
          },
        },
      },
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
