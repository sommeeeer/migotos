import type { GetStaticPropsResult } from "next/types";
import { useState } from "react";
import FilterLitters from "~/components/FilterLitters";
import Footer from "~/components/Footer";
import LitterProfile from "~/components/LitterProfile";
import { db } from "~/server/db";
import type { LitterWithTags } from "~/utils/types";


interface LittersProps {
  litters: LitterWithTags[];
  yearsArray: number[];
}

function Litters({ litters, yearsArray }: LittersProps) {
  const [littersArray, setLittersValue] = useState(litters);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);

  function filterByYear(year: number | string) {
    setCurrentFilter(year.toString());
    if (year === "All") {
      setLittersValue(litters);
    } else {
      const filteredLitters = litters.filter(
        (litter) =>
          new Date(litter.born).getFullYear().toString() === year.toString(),
      );
      setLittersValue(filteredLitters);
    }
  }

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
        <FilterLitters
          currentYear={currentFilter}
          years={yearsArray}
          filterByYear={filterByYear}
        />
        <section className="mb-8 grid max-w-6xl auto-rows-fr gap-6 p-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
          {littersArray.map((litter) => (
            <LitterProfile
              key={litter.id}
              id={litter.id}
              name={litter.name}
              post_image={litter.post_image}
              slug={litter.slug}
              tags={litter.Tag.map((tag) => tag.value)}
            />
          ))}
        </section>
      </div>
      <Footer />
    </>
  );
}
export default Litters;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<LittersProps>
> {
  const litters = await db.litter.findMany({
    orderBy: {
      born: "desc",
    },
    include: {
      Tag: true,
    },
  });

  const distinctYears: { year: number }[] = await db.$queryRaw`
    SELECT DISTINCT YEAR(born) as year FROM Litter ORDER BY year ASC
  `;


  const yearsArray = distinctYears.map((year) => year.year);

  return {
    props: {
      litters,
      yearsArray,
    },
  };
}
