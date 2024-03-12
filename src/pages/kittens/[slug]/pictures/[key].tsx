import { type Prisma, type KittenPictureImage } from "@prisma/client";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import BorderText from "~/components/BorderText";
import Image from "next/image";
import { db } from "~/server/db";
import Footer from "~/components/Footer";
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ImageCarousel from "~/components/ImageCarousel";

type LitterWithPictureWeeks = Prisma.LitterGetPayload<{
  include: {
    LitterPictureWeek: true;
  };
}>;

type Props = {
  litter: LitterWithPictureWeeks;
  groupedImages: Record<string, KittenPictureImage[]>;
  title?: string;
  alternativeTitle: string | null;
};

function KittenPictures({
  groupedImages,
  litter,
  title,
  alternativeTitle,
}: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [carouselOpen, setCarouselOpen] = useState<boolean>(false);

  const images = Object.values(groupedImages).flat();

  return (
    <>
      <PageHead litter={litter} />
      {carouselOpen && (
        <ImageCarousel
          imageIndex={currentImageIndex}
          setOpen={setCarouselOpen}
          images={images}
          name={title}
        />
      )}
      <div className="flex flex-col gap-4 px-2 mb-28">
        {alternativeTitle && (
          <p className="text-center text-lg text-zinc-500">
            {alternativeTitle}
          </p>
        )}
        {Object.entries(groupedImages).map(([key, images], groupIdx) => (
          <div key={key}>
            <BorderText text={key !== "" ? key : title} />
            <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {images.map((image, idx) => (
                <picture
                  key={image.id}
                  className="relative h-40 w-40 cursor-pointer shadow-lg sm:h-52 sm:w-52 xl:h-60 xl:w-60"
                  onClick={() => {
                    setCurrentImageIndex(
                      Object.values(groupedImages).slice(0, groupIdx).flat()
                        .length + idx,
                    );
                    setCarouselOpen(true);
                  }}
                >
                  <Image
                    src={image.src}
                    alt={image.title ?? ""}
                    fill
                    className="rounded-md object-cover object-center"
                    placeholder="blur"
                    blurDataURL={image.blururl}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 30vw"
                  />
                </picture>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
export default KittenPictures;

type Params = { slug: string; key: string };

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  const litter = await db.litter.findFirst({
    where: {
      slug: params?.slug,
    },
    include: {
      LitterPictureWeek: true,
    },
  });

  const images = await db.litterPictureWeek.findFirst({
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
    return {
      notFound: true,
    };
  }

  return {
    props: {
      litter,
      groupedImages,
      title: images.name,
      alternativeTitle: images.title,
    },
  };
}

export async function getStaticPaths() {
  const litters = await db.litter.findMany({
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

  return { paths, fallback: "blocking" };
}

function PageHead({ litter }: { litter: LitterWithPictureWeeks }) {
  const router = useRouter();
  const { key } = router.query;

  return (
    <Head>
      <title>{`${(key as string).replace("-", " ")} ${
        litter.name
      }-LITTER - Migotos`}</title>
      <link
        rel="canonical"
        href={`https://migotos.com/kittens/${litter.slug}/pictures/${
          key as string
        }`}
      />
      <meta
        name="description"
        content={`Pictures for ${litter.name} litter at ${(
          key as string
        ).replace("-", " ")}`}
      />
      <meta
        property="og:site_name"
        content={`${(key as string).replace("-", " ")} ${
          litter.name
        }-LITTER - Migotos`}
      />
      <meta
        property="og:title"
        content={`${(key as string).replace("-", " ")} ${
          litter.name
        }-LITTER - Migotos`}
      />
      <meta
        property="og:description"
        content={`Pictures for ${litter.name} litter at ${(
          key as string
        ).replace("-", " ")}`}
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`https://migotos.com/kittens/${litter.slug}/pictures/${
          key as string
        }`}
      />
      <meta
        property="og:image"
        content={litter.post_image ?? litter.mother_img}
      />
      <meta
        property="og:image:alt"
        content={`Litter post image for ${litter.name}`}
      />
      <meta property="og:image:type" content="image/png" />
      <meta
        property="article:published_time"
        content="2024-01-16T12:18:00+01:00"
      />
      <meta
        property="article:modified_time"
        content="2024-01-16T12:18:00+01:00"
      />
      <meta
        property="article:author"
        content="https://www.facebook.com/eva.d.eide"
      />
    </Head>
  );
}
