import { type CatImage as CatImageType, type Cat as Cat } from "@prisma/client";
import { db } from "~/server/db";
import Footer from "~/components/Footer";
import CatImage from "~/components/CatImage";
import Link from "next/link";
import clsx from "clsx";
import { findName } from "~/utils/helpers";
import { type GetStaticPropsContext, type GetStaticPropsResult } from "next";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import CommentForm from "~/components/CommentForm";
import Comment from "~/components/Comment";
import LoginButton from "~/components/LoginButton";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { useState } from "react";
import { IoMdClose, IoMdFemale, IoMdMale } from "react-icons/io";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import useKeypress from "react-use-keypress";
import { FaLeaf } from "react-icons/fa";
import Head from "next/head";

export const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

type Props = {
  cat: Cat & { CatImage: CatImageType[] };
  mother: Cat | null;
  father: Cat | null;
};

function Cat({ cat, mother, father }: Props) {
  const { data: session } = useSession();
  const {
    isLoading,
    data: comments,
    refetch,
  } = api.comment.getComments.useQuery({
    id: cat.id,
    commentType: "cat_id",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [carouselOpen, setCarouselOpen] = useState<boolean>(false);
  const [images, setImages] = useState<CatImageType[]>(cat.CatImage.slice(1));
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

  const profileImg = cat.CatImage[0];
  if (!profileImg) {
    throw new Error(`Couldnt find profileImg on ${cat.name}`);
  }

  const genderIcon =
    cat.gender === "Female" ? (
      <IoMdFemale className="h-8 w-8 text-pink-400" />
    ) : (
      <IoMdMale className="h-8 w-8 text-blue-500" />
    );

  const fertileText = cat.fertile ? "Yes" : "No";
  const birthFormatted = cat.birth.toLocaleDateString("no-NO");
  const currentImage = images[currentImageIndex];

  return (
    <>
      <Head>
        <title>{cat.nickname} - Migotos</title>
        <meta
          name="description"
          content={`Profile page for ${cat.name}, ${cat.stamnavn}`}
        />
        <meta property="og:site_name" content={`${cat.nickname} - Migotos`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={`${cat.nickname} - Migotos`} />
        <meta
          property="og:description"
          content={`Profile page for ${cat.name}, ${cat.stamnavn}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://migotos.com/cats/${cat.slug}`}
        />
        <meta property="og:image" content={cat.CatImage[0]?.src} />
        <meta
          property="og:image:alt"
          content={`Profile image of ${cat.nickname}`}
        />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:image:width"
          content={cat.CatImage[0]?.width.toString()}
        />
        <meta
          property="og:image:height"
          content={cat.CatImage[0]?.height.toString()}
        />
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
                alt={`${cat.name} picture`}
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
      <div className="flex w-full flex-col items-center bg-zinc-100">
        <section className="mt-12 flex max-w-4xl flex-col items-center gap-4 p-4 text-center sm:mt-16">
          <h1 className="font-playfair text-4xl">
            <em>{cat.name}</em>
          </h1>
          <p
            className={clsx(
              "text-lg text-zinc-500",
              !cat.pedigreeurl && "mb-4",
            )}
          >
            {cat.stamnavn}
          </p>
          {cat.pedigreeurl && (
            <Link
              href={cat.pedigreeurl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <p className="mb-4 text-lg uppercase text-[#847143]">PEDIGREE</p>
            </Link>
          )}
          {genderIcon}

          <CatImage
            src={profileImg.src}
            alt={`${cat.name} picture`}
            width={profileImg.width}
            height={profileImg.height}
            className="my-2 rounded-full"
            quality={100}
            {...(profileImg.blururl
              ? { placeholder: "blur", blurDataURL: profileImg.blururl }
              : {})}
          />
          {cat.description && (
            <p className="mb-6 max-w-prose text-[15px] leading-8 text-zinc-500">
              {cat.description}
            </p>
          )}
        </section>
        <section className="mt-10 flex w-full flex-col items-center gap-8 bg-white p-4">
          <h3 className="self-center font-playfair text-2xl">Information</h3>
          <div className="-mt-2 text-left leading-8 text-[#515151]">
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <span className="w-16 text-right font-semibold uppercase">
                BIRTH
              </span>
              <p>{birthFormatted}</p>
            </div>
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <span className="w-16 text-right font-semibold uppercase">
                FERTILE
              </span>
              <div className="flex items-center gap-2">
                <p>{fertileText}</p>
                {fertileText === "Yes" && (
                  <FaLeaf className="-rotate-12 text-green-600" />
                )}
              </div>
            </div>
            {father && (
              <Link href={`/cats/${father.slug}`}>
                <div className="flex gap-4 sm:gap-6 md:gap-8">
                  <span className="w-16 text-right font-semibold uppercase">
                    Father
                  </span>
                  <p>
                    <span className="text-[#847143] underline">
                      {cat.father}
                    </span>
                  </p>
                </div>
              </Link>
            )}
            {!father && (
              <div className="flex gap-4 sm:gap-6 md:gap-8">
                <span className="w-16 text-right font-semibold uppercase">
                  Father
                </span>
                <p>{cat.father}</p>
              </div>
            )}
            {mother && (
              <Link href={`/cats/${mother.slug}`}>
                <div className="flex gap-4 sm:gap-6 md:gap-8">
                  <span className="w-16 text-right font-semibold uppercase">
                    Mother
                  </span>
                  <p>
                    <span className="text-[#847143] underline">
                      {cat.mother}
                    </span>
                  </p>
                </div>
              </Link>
            )}
            {!mother && (
              <div className="flex gap-4 sm:gap-6 md:gap-8">
                <span className="w-16 text-right font-semibold uppercase">
                  Mother
                </span>
                <p>{cat.mother}</p>
              </div>
            )}
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <span className="w-16 text-right font-semibold uppercase">
                BREEDER
              </span>
              <p>{cat.breeder}</p>
            </div>
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <span className="w-16 text-right font-semibold uppercase">
                OWNER
              </span>
              <p>{cat.owner}</p>
            </div>
          </div>
          <h3 className="self-center font-playfair text-2xl">Pictures</h3>
          <section className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {cat.CatImage.slice(1).map((img, idx) => {
              return (
                <picture
                  onClick={() => {
                    setCurrentImageIndex(idx);
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
      <section className="mt-12 flex max-w-5xl flex-col gap-4 px-4">
        <AnimatePresence>
          {isLoading && <LoadingSpinner />}
          {comments?.map((comment) => (
            <Comment
              key={comment.id}
              commentId={comment.id}
              userId={comment.user.id}
              avatar_src={comment.user?.image}
              date={comment.createdAt}
              name={comment.user.name}
              message={comment.comment}
              session={session ?? null}
              refetchPosts={refetch}
              email={comment.user.email ?? undefined}
            />
          ))}
        </AnimatePresence>
        <div className="my-8">
          {session ? (
            <CommentForm
              session={session}
              id={cat.id}
              refetchPosts={refetch}
              commentType="cat_id"
            />
          ) : (
            <LoginButton />
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Cat;

type Params = { slug: string };

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  const slug = params?.slug;

  const cat = await db.cat.findFirst({
    where: {
      slug,
    },
    include: {
      CatImage: {
        orderBy: {
          priority: "asc",
        },
      },
    },
  });

  if (!cat) {
    return {
      notFound: true,
    };
  }

  const motherSearchStr = findName(cat.mother);
  const fatherSearchStr = findName(cat.father);

  const searchFiltersMother = motherSearchStr.map((partialName) => ({
    name: {
      contains: partialName,
    },
  }));

  let mother = await db.cat.findFirst({
    where: {
      OR: searchFiltersMother,
    },
  });

  if (
    cat.mother.includes("Je Suis Belle") &&
    mother?.name.includes("Decibelle")
  ) {
    mother = null;
  }

  const searchFiltersFather = fatherSearchStr.map((partialName) => ({
    name: {
      contains: partialName,
    },
  }));

  let father = await db.cat.findFirst({
    where: {
      OR: searchFiltersFather,
    },
  });

  if (father?.name.toLowerCase().includes("georg")) {
    father = null;
  }

  return {
    props: {
      cat,
      mother,
      father,
    },
  };
}

export async function getStaticPaths() {
  const cats = await db.cat.findMany();

  const paths = cats.map((cat) => ({
    params: { slug: cat.slug },
  }));

  return { paths, fallback: "blocking" };
}
