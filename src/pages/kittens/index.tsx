import { PrismaClient, type Litter, Kitten } from "@prisma/client";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import LitterProfile from "~/components/LitterProfile";

interface KittensProps {
  litters: Litter[];
}

function Kittens({ litters }: KittensProps) {
  console.log(litters.at(0));
  return (
    <>
      <div className="flex w-full flex-col items-center bg-zinc-100">
        <section className="mt-16 flex max-w-6xl flex-col gap-4 px-4 text-center">
          <h1 className="font-playfair text-4xl">
            <em>All Litters</em>
          </h1>
          <p className="text-base uppercase text-zinc-600"></p>
          <p className="text-base leading-loose text-zinc-500">
            A short presentation of our litters. <br />
            Click on their picture for further information.
          </p>
        </section>
        <section className="grid max-w-6xl auto-rows-fr gap-6 p-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
          {litters.map((litter) => (
            <LitterProfile
              key={litter.id}
              id={litter.id}
              name={litter.name}
              post_image={litter.post_image ? litter.post_image : "placeholder"}
              slug={litter.slug}
              // tags={JSON.parse(litter.tags) as string[]}
            />
          ))}
        </section>
      </div>
      <Footer />
    </>
  );
}
export default Kittens;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<KittensProps>
> {
  // must be async
  const prisma = new PrismaClient();

  const litters = await prisma.litter.findMany({
    orderBy: {
      born: "desc",
    },
  });

  return {
    props: {
      litters,
    },
  };
}
