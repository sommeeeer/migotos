import { db } from "~/server/db";
import { type Cat, type CatImage } from "@prisma/client";
import { type GetStaticPropsResult } from "next";
import BorderText from "~/components/BorderText";
import CatsGrid from "~/components/CatsGrid";
import Footer from "~/components/Footer";
import Head from "next/head";

export interface CatWithImage extends Cat {
  CatImage: CatImage[];
}

type Props = {
  fertileMaleCats: CatWithImage[];
  fertileFemaleCats: CatWithImage[];
  formerMaleCats: CatWithImage[];
  formerFemaleCats: CatWithImage[];
};

function Cats({
  fertileMaleCats,
  fertileFemaleCats,
  formerMaleCats,
  formerFemaleCats,
}: Props) {
  return (
    <>
      <PageHead />
      <div className="flex w-full flex-col items-center bg-zinc-100">
        <section className="mt-16 mb-24 flex max-w-6xl flex-col gap-4 px-4 text-center">
          <h1 className="font-playfair text-4xl">
            <em>Breeding Cats</em>
          </h1>
          <p className="text-base uppercase text-zinc-600">MALES & FEMALES</p>
          <p className="mt-4 text-base leading-loose text-zinc-500">
            A short presentation of our cats. <br />
            Click on their picture for further information.
          </p>
          <BorderText text="Males" />
          <CatsGrid cats={fertileMaleCats} />
          <BorderText text="Females" />
          <CatsGrid cats={fertileFemaleCats} />
          <h1 className="mt-20 font-playfair text-4xl">
            <em>Former Breeding Cats</em>
          </h1>
          <p className="text-base uppercase text-zinc-600">MALES & FEMALES</p>
          <p className="mt-4 text-base leading-loose text-zinc-500">
            A short presentation of our former breeding cats.
            <br />
            Click on their picture for further information.
          </p>
          <BorderText text="Males" />
          <CatsGrid cats={formerMaleCats} />
          <BorderText text="Females" />
          <CatsGrid cats={formerFemaleCats} />
        </section>
      </div>
      <Footer />
    </>
  );
}
export default Cats;

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const [fertileMaleCats, fertileFemaleCats, formerMaleCats, formerFemaleCats] =
    await Promise.all([
      db.cat.findMany({
        where: {
          fertile: true,
          gender: "Male",
        },
        include: {
          CatImage: {
            take: 1,
          },
        },
      }),
      db.cat.findMany({
        where: {
          fertile: true,
          gender: "Female",
        },
        include: {
          CatImage: {
            take: 1,
          },
        },
      }),
      db.cat.findMany({
        where: {
          fertile: false,
          gender: "Male",
        },
        include: {
          CatImage: {
            take: 1,
          },
        },
      }),
      db.cat.findMany({
        where: {
          fertile: false,
          gender: "Female",
        },
        include: {
          CatImage: {
            take: 1,
          },
        },
      }),
    ]);

  return {
    props: {
      fertileMaleCats: fertileMaleCats,
      fertileFemaleCats: fertileFemaleCats,
      formerMaleCats: formerMaleCats,
      formerFemaleCats: formerFemaleCats,
    },
  };
}

function PageHead() {
  return (
    <Head>
      <title>Cats - Migotos</title>
      <link rel="canonical" href="https://migotos.com/cats" />
      <meta
        name="description"
        content="All the cats for Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
      />
      <meta property="og:site_name" content="Cats - Migotos" />
      <meta property="og:title" content="Cats - Migotos" />
      <meta
        property="og:description"
        content="All the cats for Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://migotos.com/cats" />
      <meta
        property="og:image"
        content="https://migotos.com/static/icons/cropped-socialicon-480x480.png"
      />
      <meta property="og:image:alt" content="Migotos logo" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="480" />
      <meta property="og:image:height" content="480" />
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
