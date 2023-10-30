import { type Cat, type Prisma } from "@prisma/client";
import { AnimatePresence } from "framer-motion";
import { type GetStaticPropsResult, type GetStaticPropsContext } from "next";
import Link from "next/link";
import CatProfile from "~/components/CatProfile";
import Footer from "~/components/Footer";
import KittenProfile from "~/components/KittenProfile";
import PictureButton from "~/components/PictureButton";
import Comment from "~/components/Comment";
import CommentForm from "~/components/CommentForm";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { getBase64 } from "~/lib/getBase64";
import { db } from "~/server/db";
import { findName, formatDate } from "~/utils/helpers";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import LoginButton from "~/components/LoginButton";

type LitterWithKittensAndTagsAndPictures = Prisma.LitterGetPayload<{
  include: {
    Kitten: true;
    Tag: true;
    LitterPictureWeek: true;
  };
}>;

type Props = {
  litter: LitterWithKittensAndTagsAndPictures;
  mother: Cat | null;
  father: Cat | null;
  motherBlurData: string | undefined;
  fatherBlurData: string | undefined;
};

function LitterPage({
  litter,
  mother,
  father,
  motherBlurData,
  fatherBlurData,
}: Props) {
  const { data: session, status } = useSession();
  const {
    isLoading,
    data: comments,
    refetch,
  } = api.comment.getComments.useQuery({
    id: litter.id,
    commentType: "litter_id",
  });

  let mother_slug = "";
  let father_slug = "";
  if (mother?.slug) {
    mother_slug = mother.slug;
  }
  if (father?.slug) {
    father_slug = father.slug;
  }

  const isWeeks = litter.LitterPictureWeek.some(
    (week) => !isNaN(+week.name.charAt(0)),
  );

  const picturesSubHeading = isWeeks ? "FROM 0-12 WEEKS" : "CLICK ON NAME";

  const pictureWeeks = litter.LitterPictureWeek.map((week) => (
    <PictureButton
      label={week.name}
      url={`${litter.slug}/pictures/${week.name}`}
      key={week.id}
    />
  ));

  return (
    <>
      <div className="mb-10 flex w-full flex-col items-center border-b bg-zinc-100">
        <section className="mt-12 flex max-w-4xl flex-col items-center gap-4 p-4 text-center sm:mt-16">
          <h1 className="font-playfair text-4xl capitalize">
            <em>{litter.name.toLowerCase()}</em>
          </h1>
          <p className="text-lg uppercase text-zinc-500">
            {formatDate(litter.born.toISOString())}
          </p>
          {litter.pedigreeurl && (
            <Link
              href={litter.pedigreeurl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <p className="uppercas text-lg text-[#847143]">PEDIGREE</p>
            </Link>
          )}
          <section className="flex flex-col md:flex-row md:items-end md:gap-20">
            <CatProfile
              imageSrc={litter.mother_img}
              name={litter.mother_name}
              tribalName={litter.mother_stamnavn}
              slug={mother_slug}
              classNames="my-8"
              blurData={motherBlurData}
            />
            <CatProfile
              imageSrc={litter.father_img}
              name={litter.father_name}
              tribalName={litter.father_stamnavn}
              slug={father_slug}
              classNames="mb-8"
              blurData={fatherBlurData}
            />
          </section>
          {litter.description?.split("\n").map((p, i) => (
            <p
              key={i}
              className="self-start text-left text-[15px] leading-8 text-[#515151]"
            >
              {p}
            </p>
          ))}
        </section>
        <section className="mx-2 my-6 flex flex-col flex-wrap justify-center gap-4 sm:grid sm:grid-cols-3 sm:gap-8 md:flex md:flex-row md:gap-14">
          {litter.Kitten.map((k, i) => (
            <KittenProfile
              key={i}
              name={k.name}
              info={k.info ?? ""}
              stamnavn={k.stamnavn}
              gender={k.gender}
            />
          ))}
        </section>
        <section className="flex w-full flex-col items-center gap-2 bg-white p-8 text-center">
          <header className="mb-6 flex flex-col gap-2">
            <h1 className="font-playfair text-4xl">Pictures</h1>
            <p className="text-lg uppercase text-zinc-500">
              {picturesSubHeading}
            </p>
          </header>
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
            {pictureWeeks}
          </div>
        </section>
      </div>
      <section className="flex flex-col w-full max-w-5xl px-4 gap-4">
        <AnimatePresence>
          {isLoading && <LoadingSpinner />}
          {comments?.map((comment) => (
            <Comment
              key={comment.id}
              commentId={comment.id}
              userId={comment.user.id}
              avatar_src={comment.user?.image}
              date={comment.createdAt}
              name={comment.user.name!}
              message={comment.comment}
              session={session ?? null}
              refetchPosts={refetch}
            />
          ))}
        </AnimatePresence>
        <div className="my-8">
          {session ? (
            <CommentForm
              session={session}
              id={litter.id}
              refetchPosts={refetch}
              commentType="litter_id"
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

export default LitterPage;

type Params = { slug: string };

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  const slug = params?.slug;

  const litter = await db.litter.findFirst({
    where: {
      slug,
    },
    include: {
      Kitten: true,
      Tag: true,
      LitterPictureWeek: true,
    },
  });
  if (!litter) {
    throw new Error(`Couldnt find litter with slug: ${params?.slug}`);
  }
  const motherSearchStr = findName(litter.mother_name);
  const fatherSearchStr = findName(litter.father_name);

  const searchFiltersMother = motherSearchStr.map((partialName) => ({
    name: {
      contains: partialName,
    },
  }));

  const mother = await db.cat.findFirst({
    where: {
      OR: searchFiltersMother,
    },
  });

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

  const motherBlurData = await getBase64(litter.mother_img);
  const fatherBlurData = await getBase64(litter.father_img);

  return {
    props: {
      litter,
      mother,
      father,
      motherBlurData,
      fatherBlurData,
    },
  };
}

export async function getStaticPaths() {
  const litters = await db.litter.findMany();

  const paths = litters.map((litter) => ({
    params: { slug: litter.slug },
  }));

  return { paths, fallback: false };
}
