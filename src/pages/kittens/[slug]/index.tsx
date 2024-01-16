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
import { db } from "~/server/db";
import { findName, formatDate } from "~/utils/helpers";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import LoginButton from "~/components/LoginButton";
import Head from "next/head";

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
};

function LitterPage({ litter, mother, father }: Props) {
  const { data: session } = useSession();
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

  const pictureWeeks = [...litter.LitterPictureWeek]
    .sort((a, b) => (a.name === "Newborn" ? -1 : b.name === "Newborn" ? 1 : 0))
    .map((week) => (
      <PictureButton
        label={week.name.replace("-", " ")}
        url={`${litter.slug}/pictures/${week.name}`}
        key={week.id}
      />
    ));

  return (
    <>
      <PageHead litter={litter} />
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
              <p className="text-lg uppercase text-[#847143]">PEDIGREE</p>
            </Link>
          )}
          <section className="flex flex-col md:flex-row md:items-end md:gap-20">
            <CatProfile
              imageSrc={litter.mother_img}
              name={litter.mother_name}
              tribalName={litter.mother_stamnavn}
              slug={mother_slug}
              classNames="my-8"
              blurData={litter.mother_img_blururl}
            />
            <CatProfile
              imageSrc={litter.father_img}
              name={litter.father_name}
              tribalName={litter.father_stamnavn}
              slug={father_slug}
              classNames="mb-8"
              blurData={litter.mother_img_blururl}
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
      <section className="flex max-w-5xl flex-col gap-4 px-4">
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
    return {
      notFound: true,
    };
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

  return {
    props: {
      litter,
      mother,
      father,
    },
  };
}

export async function getStaticPaths() {
  const litters = await db.litter.findMany();

  const paths = litters.map((litter) => ({
    params: { slug: litter.slug },
  }));

  return { paths, fallback: "blocking" };
}

function PageHead({ litter }: { litter: LitterWithKittensAndTagsAndPictures }) {
  return (
    <Head>
      <title>{litter.name}-LITTER - Migotos</title>
      <link
        rel="canonical"
        href={`https://migotos.com/kittens/${litter.slug}`}
      />
      <meta
        name="description"
        content={`Litter profile page for ${litter.name}`}
      />
      <meta
        property="og:site_name"
        content={`${litter.name}-LITTER - Migotos`}
      />
      <meta property="og:title" content={`${litter.name}-LITTER - Migotos`} />
      <meta
        property="og:description"
        content={`Litter profile page for ${litter.name}`}
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`https://migotos.com/kittens/${litter.slug}`}
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
