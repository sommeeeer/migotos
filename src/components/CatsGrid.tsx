import CatProfile from "~/components/CatProfile";
import { type CatWithImage } from "~/pages/cats";

interface CatsGridProps {
  cats: CatWithImage[];
}

export default function CatsGrid({ cats }: CatsGridProps) {
  return (
    <section className="mb-8 flex flex-col items-center gap-8 px-4 sm:grid sm:grid-cols-2 sm:items-start md:grid md:grid-cols-3">
      {cats.map((cat) => {
        const image = cat.CatImage[0];
        return (
          <CatProfile
            key={cat.id}
            imageSrc={`${image?.src}}`}
            name={cat.name}
            tribalName={cat.stamnavn}
            slug={cat.slug}
            blurData={image?.blur}
          />
        );
      })}
    </section>
  );
}
