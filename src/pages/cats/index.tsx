import { PrismaClient, type Cat, type CatImage } from "@prisma/client";
import BorderText from "~/components/BorderText";
import CatsGrid from "~/components/CatsGrid";
import Footer from "~/components/Footer";

export interface CatWithImage extends Cat {
  CatImage: CatImage[];
}

interface CatsProps {
  fertileMaleCats: CatWithImage[];
  fertileFemaleCats: CatWithImage[];
  formerMaleCats: CatWithImage[];
  formerFemaleCats: CatWithImage[];
}

function Cats({
  fertileMaleCats,
  fertileFemaleCats,
  formerMaleCats,
  formerFemaleCats,
}: CatsProps) {
  return (
    <>
      <div className="flex w-full flex-col items-center bg-zinc-100">
        <section className="mt-16 flex max-w-6xl flex-col gap-4 px-4 text-center">
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

export async function getStaticProps() {
  // must be async
  const prisma = new PrismaClient();
  const fertileMaleCats = await prisma.cat.findMany({
    where: {
      fertile: true,
      gender: "Male",
    },
    include: {
      CatImage: {
        take: 1,
      },
    },
  });
  const fertileFemaleCats = await prisma.cat.findMany({
    where: {
      fertile: true,
      gender: "Female",
    },
    include: {
      CatImage: {
        take: 1,
      },
    },
  });

  const formerMaleCats = await prisma.cat.findMany({
    where: {
      fertile: false,
      gender: "Male",
    },
    include: {
      CatImage: {
        take: 1,
      },
    },
  });
  const formerFemaleCats = await prisma.cat.findMany({
    where: {
      fertile: false,
      gender: "Female",
    },
    include: {
      CatImage: {
        take: 1,
      },
    },
  });

  return {
    props: {
      fertileMaleCats,
      fertileFemaleCats,
      formerMaleCats,
      formerFemaleCats,
    },
  };
}