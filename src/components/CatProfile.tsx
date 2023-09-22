import Image from "next/image";
import Link from "next/link";

interface CatProfileProps {
  imageSrc: string | undefined;
  name: string;
  tribalName: string;
  slug?: string;
  classNames?: string;
  blurData?: string;
}

export default function CatProfile({
  imageSrc,
  name,
  tribalName,
  slug,
  classNames = "",
  blurData,
}: CatProfileProps) {
  const classes = `flex flex-col items-center gap-2 text-center transition duration-300 ease-in-out ${classNames}`;

  if (!slug) {
    return (
      <div className={classes}>
        <Image
          src={imageSrc ?? ""}
          alt={name}
          width={200}
          height={200}
          className="rounded-full"
          quality={100}
          placeholder="blur"
          blurDataURL={blurData}
        />
        <h3 className="font-playfair text-2xl">{name}</h3>
        <p className="text-base text-zinc-500">{tribalName}</p>
      </div>
    );
  }

  return (
    <Link href={`/cats/${slug}`} className={classes}>
      <Image
        src={imageSrc ?? ""}
        alt={name}
        width={200}
        height={200}
        className="rounded-full"
        quality={100}
        placeholder="blur"
        blurDataURL={blurData}
      />
      <h3 className="font-playfair text-2xl">{name}</h3>
      <p className="text-base text-zinc-500">{tribalName}</p>
    </Link>
  );
}
