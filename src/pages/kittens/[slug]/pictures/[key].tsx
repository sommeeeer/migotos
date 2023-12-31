import { type Prisma, type KittenPictureImage } from "@prisma/client";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import BorderText from "~/components/BorderText";
import Image from "next/image";
import { db } from "~/server/db";
import Footer from "~/components/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import useKeypress from "react-use-keypress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CatImage from "~/components/CatImage";
import { IoMdClose } from "react-icons/io";

type Props = {
  litter: Prisma.LitterGetPayload<{
    include: {
      LitterPictureWeek: true;
    };
  }>;
  groupedImages: Record<string, KittenPictureImage[]>;
};

function KittenPictures({ groupedImages }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [carouselOpen, setCarouselOpen] = useState<boolean>(false);
  const [images, setImages] = useState<KittenPictureImage[]>(
    Object.values(groupedImages).flat(),
  );
  const [direction, setDirection] = useState(0);

  const goToNextImage = () => {
    setDirection(1);
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setDirection(-1);
    setCurrentImageIndex(
      (currentImageIndex - 1 + images.length) % images.length,
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      goToNextImage();
    },
    onSwipedRight: () => {
      goToPreviousImage();
    },
    trackMouse: true,
  });

  useKeypress("ArrowRight", () => {
    goToNextImage();
  });

  useKeypress("ArrowLeft", () => {
    goToPreviousImage();
  });

  useKeypress("Escape", () => {
    setCarouselOpen(false);
  });

  const currentImage = images[currentImageIndex];

  const cumulativeLengths = Object.values(groupedImages).map(
    (images, i, arr) =>
      i === 0 ? images.length : images.length + arr[i - 1]!.length,
  );

  return (
    <>
      {carouselOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        >
          <div
            className="absolute inset-0 cursor-default bg-black backdrop-blur-2xl"
            onClick={() => {
              setCarouselOpen(false);
            }}
          ></div>
          <div className="relative flex flex-col" {...handlers}>
            <button
              className="absolute right-3 top-2 z-20 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
              onClick={() => {
                setCarouselOpen(false);
              }}
            >
              <IoMdClose className="h-6 w-6 text-white" />
            </button>
            <motion.div
              key={currentImage.id}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CatImage
                src={currentImage.src}
                alt={`${currentImage.title} picture`}
                width={currentImage.width}
                height={currentImage.height}
                className="z-10"
                {...(currentImage.blururl
                  ? {
                      placeholder: "blur",
                      blurDataURL: currentImage.blururl,
                    }
                  : {})}
              />
              <h3 className="mt-2 text-center text-xl text-white sm:mt-3 md:mt-4 md:text-2xl">
                {currentImage.title}
              </h3>
            </motion.div>
            <button
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
              onClick={goToPreviousImage}
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <button
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
              onClick={goToNextImage}
            >
              <ArrowRight className="h-6 w-6 text-white" />
            </button>
          </div>
        </motion.div>
      )}
      <div className="flex flex-col gap-4 px-2">
        {Object.entries(groupedImages).map(([key, images], groupIdx) => (
          <div key={key}>
            <BorderText text={key} />
            <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {images.map((image, idx) => (
                <picture
                  key={image.id}
                  className="relative h-40 w-40 cursor-pointer sm:h-52 sm:w-52 xl:h-60 xl:w-60"
                  onClick={() => {
                    const flatIndex =
                      groupIdx === 0
                        ? idx
                        : cumulativeLengths[groupIdx - 1]! + idx;
                    setCurrentImageIndex(flatIndex);
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
