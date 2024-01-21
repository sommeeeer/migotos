import type { Prisma } from "@prisma/client";
import type { GetStaticPropsResult } from "next";
import { useState } from "react";
import CatImage from "~/components/CatImage";
import ImageCarousel from "~/components/ImageCarousel";
import { db } from "~/server/db";

interface Props {
  cat: Prisma.CatGetPayload<{
    include: {
      CatImage: true;
    };
  }>;
}

export default function TestPage({ cat }: Props) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <>
      {carouselOpen && (
        <ImageCarousel
          images={cat.CatImage}
          name={cat.name}
          setOpen={setCarouselOpen}
          imageIndex={imageIndex}
        />
      )}
      <div className="flex w-full flex-col items-center bg-zinc-100">
        <section className="mt-12 flex max-w-4xl flex-col items-center gap-4 p-4 text-center sm:mt-16">
          <h1 className="font-playfair text-4xl">
            <em>{cat.name}</em>
          </h1>
          <h3 className="self-center font-playfair text-2xl">Pictures</h3>
          <section className="grid grid-cols-2 gap-4">
            {cat.CatImage.slice(1).map((img, idx) => {
              return (
                <picture
                  onClick={() => {
                    setImageIndex(idx);
                    setCarouselOpen(true);
                  }}
                  key={img.id}
                  className="relative h-40 w-40 cursor-pointer sm:h-52 sm:w-52 xl:h-60 xl:w-60"
                >
                  <CatImage
                    src={img.src}
                    alt={`${cat.name} picture`}
                    fill
                    className="rounded-md object-cover object-center"
                    {...(img.blururl
                      ? { placeholder: "blur", blurDataURL: img.blururl }
                      : {})}
                  />
                </picture>
              );
            })}
          </section>
        </section>
      </div>
    </>
  );
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const cat = await db.cat.findFirst({
    where: {
      id: 52,
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
