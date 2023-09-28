import {
  type Prisma,
  PrismaClient,
  type KittenPictureImage,
} from "@prisma/client";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import BorderText from "~/components/BorderText";
import Image from "next/image";

type Props = {
  litter: Prisma.LitterGetPayload<{
    include: {
      LitterPictureWeek: true;
    };
  }>;
  groupedImages: Record<string, KittenPictureImage[]>;
};

function KittenPictures({ litter, groupedImages }: Props) {
  return (
    <div className="flex flex-col gap-4 px-2">
      {Object.entries(groupedImages).map(([key, images]) => (
        <div key={key}>
          <BorderText text={key} />
          <div className="flex flex-col gap-2">
            {images.map((image) => (
              <div key={image.id}>
                <Image
                  src={image.src}
                  alt={image.title ?? ""}
                  width={650}
                  height={400}
                  style={{ height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KittenPictures;

type Params = { slug: string; key: string };

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  const prisma = new PrismaClient();

  const litter = await prisma.litter.findFirst({
    where: {
      slug: params?.slug,
    },
    include: {
      LitterPictureWeek: true,
    },
  });

  const images = await prisma.litterPictureWeek.findFirst({
    where: {
      litter_id: litter?.id,
      name: params?.key,
    },
    include: {
      KittenPictureImage: true,
    },
  });

  const groupedImages: Record<string, KittenPictureImage[]> = {};
  images?.KittenPictureImage.forEach((image) => {
    if (!groupedImages[image.title ?? ""]) {
      groupedImages[image.title ?? ""] = [];
    }
    groupedImages[image.title ?? ""]!.push(image);
  });

  if (!litter || !images) {
    throw new Error(
      `Couldnt find pictures for: ${params?.slug} ${params?.key} ${litter?.id}`,
    );
  }

  return {
    props: {
      litter,
      groupedImages,
    },
  };
}

export async function getStaticPaths() {
  const prisma = new PrismaClient();
  const litters = await prisma.litter.findMany({
    include: {
      LitterPictureWeek: true,
    },
  });
  const paths = [];

  for (const l of litters) {
    const weeks = l.LitterPictureWeek.map((w) => w.name);
    for (const w of weeks) {
      paths.push({
        params: {
          slug: l.slug,
          key: w,
        },
      });
    }
  }

  return { paths, fallback: false };
}
