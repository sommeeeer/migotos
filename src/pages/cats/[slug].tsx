import { PrismaClient, type Cat as Cat } from "@prisma/client";
import Footer from "~/components/Footer";
import CatImage from "~/components/CatImage";
import Link from "next/link";
import clsx from "clsx";
import { findName } from "~/utils/helpers";
import { type GetStaticPropsContext, type GetStaticPropsResult } from "next";
import addBlurredDataurls, { type CatImageWithBlur } from "~/lib/getBase64";

type Props = {
  cat: Cat & { CatImage: CatImageWithBlur[] };
  mother: Cat | null;
  father: Cat | null;
};

function Cat({ cat, mother, father }: Props) {
  const profileImg = cat.CatImage[0];
  if (!profileImg) {
    throw new Error(`Couldnt find profileImg on ${cat.name}`);
  }

  const fertileText = cat.fertile ? "Yes" : "No";
  const birthFormatted = new Date(cat.birth).toLocaleDateString();

  return (
    <>
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

          <CatImage
            src={profileImg.src}
            alt={`${cat.name} picture`}
            width={profileImg.width}
            height={profileImg.height}
            className="mb-2 rounded-full"
            placeholder="blur"
            quality={100}
            blurDataURL={profileImg.blur}
          />
          {cat.description && (
            <p className="mb-6 max-w-prose text-[15px] leading-8 text-zinc-500">
              {cat.description}
            </p>
          )}
        </section>
        <section className="flex w-full flex-col items-center gap-8 bg-white p-4">
          <h3 className="self-center font-playfair text-2xl">Information</h3>
          <div className="-mt-2 text-left leading-8 text-[#515151]">
            <p>{`Birth: ${birthFormatted}`}</p>
            <p>{`Gender: ${cat.gender}`}</p>
            <p>{`Fertile: ${fertileText}`}</p>
            {father && (
              <Link href={`/cats/${father.slug}`}>
                <p>
                  Father:{" "}
                  <span className="text-[#847143] underline">{cat.father}</span>
                </p>
              </Link>
            )}
            {!father && <p>{`Father: ${cat.father}`}</p>}
            {mother && (
              <Link href={`/cats/${mother.slug}`}>
                <p>
                  Mother:{" "}
                  <span className="text-[#847143] underline">{cat.mother}</span>
                </p>
              </Link>
            )}
            {!mother && <p>{`Mother: ${cat.mother}`}</p>}
            <p>{`Breeder: ${cat.breeder}`}</p>
            <p>{`Owner: ${cat.owner}`}</p>
          </div>
          <h3 className="self-center font-playfair text-2xl">Pictures</h3>
          <section className="flex flex-col items-center gap-4">
            {cat.CatImage.slice(1).map((img) => {
              return (
                <CatImage
                  key={img.src}
                  src={img.src}
                  alt={`${cat.name} picture`}
                  width={img.width}
                  height={img.height}
                  placeholder="blur"
                  blurDataURL={img.blur}
                />
              );
            })}
          </section>
        </section>
      </div>
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
  const prisma = new PrismaClient();

  const cat = await prisma.cat.findFirst({
    where: {
      slug,
    },
    include: {
      CatImage: true,
    },
  });
  if (!cat) {
    throw new Error(`Couldnt find cat with slug: ${params?.slug}`);
  }

  const motherSearchStr = findName(cat.mother);
  const fatherSearchStr = findName(cat.father);

  const searchFiltersMother = motherSearchStr.map((partialName) => ({
    name: {
      contains: partialName,
    },
  }));

  let mother = await prisma.cat.findFirst({
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

  let father = await prisma.cat.findFirst({
    where: {
      OR: searchFiltersFather,
    },
  });

  if (father?.name.toLowerCase().includes("georg")) {
    father = null;
  }

  const imagesWithDataUrls = await addBlurredDataurls(cat.CatImage);

  const catImages = imagesWithDataUrls;

  const catwithBlur = {
    ...cat,
    CatImage: catImages,
  };

  return {
    props: {
      cat: catwithBlur,
      mother,
      father,
    },
  };
}

export async function getStaticPaths() {
  const prisma = new PrismaClient();
  const cats = await prisma.cat.findMany();

  const paths = cats.map((cat) => ({
    params: { slug: cat.slug },
  }));

  return { paths, fallback: false };
}
