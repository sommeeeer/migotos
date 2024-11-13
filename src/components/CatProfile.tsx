import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { IMAGE_QUALITY } from "~/lib/utils";

interface CatProfileProps {
  imageSrc: string | undefined;
  name: string;
  tribalName: string;
  slug?: string;
  classNames?: string;
  blurData: string | null;
}

export default function CatProfile({
  imageSrc,
  name,
  tribalName,
  slug,
  classNames = "",
  blurData,
}: CatProfileProps) {
  const classes = twMerge(
    "flex flex-col items-center gap-2 text-center transition duration-300 ease-in-out",
    classNames,
  );

  if (!slug) {
    return (
      <div className={classes}>
        {blurData ? (
          <Image
            src={imageSrc ?? ""}
            alt={name}
            width={200}
            height={200}
            className="rounded-full shadow-md"
            quality={IMAGE_QUALITY}
            placeholder="blur"
            blurDataURL={blurData}
          />
        ) : (
          <Image
            src={imageSrc ?? ""}
            alt={name}
            width={200}
            height={200}
            className="rounded-full shadow-md"
            quality={IMAGE_QUALITY}
          />
        )}
        <h3 className="font-playfair text-2xl">{name}</h3>
        <p className="text-base text-zinc-500">{tribalName}</p>
      </div>
    );
  }

  return (
    <Link href={`/cats/${slug}`} className={classes}>
      {blurData ? (
        <Image
          src={imageSrc ?? ""}
          alt={name}
          width={200}
          height={200}
          className="rounded-full shadow-md"
          quality={IMAGE_QUALITY}
          placeholder="blur"
          blurDataURL={blurData}
        />
      ) : (
        <Image
          src={imageSrc ?? ""}
          alt={name}
          width={200}
          height={200}
          className="rounded-full shadow-md"
          quality={IMAGE_QUALITY}
        />
      )}
      <h3 className="font-playfair text-2xl">{name}</h3>
      <p className="text-base text-zinc-500">{tribalName}</p>
    </Link>
  );
}
