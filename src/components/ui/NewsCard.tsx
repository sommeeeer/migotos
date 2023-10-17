import Image from "next/image";
import type { ComponentProps } from "react";

interface Props {
  title: string;
  date: string;
  tags: string[];
  image_src: string | null;
}

export default function NewsCard({ title, date, tags, image_src }: Props) {
  return (
    <div className="flex max-w-sm cursor-pointer flex-col justify-between overflow-hidden rounded shadow-md bg-slate-50">
      {image_src ? (
        <Image
          className="h-[200px] w-full object-cover"
          src={image_src ?? ""}
          alt="Sunset in the mountains"
          width={384}
          quality={100}
          height={167}
        />
      ) : (
        <div className="h-[200px] w-full bg-gray-300"></div>
      )}

      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="mb-2 text-xl font-bold">{title}</div>
        <p className="text-gray-600">{date}</p>
      </div>
      <div className="self-start px-6 pb-2 pt-4">
        {tags.map((tag) => (
          <Tag
            key={tag}
            value={tag}
            onClick={() => console.log("tag: ", tag)}
          />
        ))}
      </div>
    </div>
  );
}

function Tag({ value, ...rest }: { value: string } & ComponentProps<"span">) {
  return (
    <span
      {...rest}
      className="mb-2 mr-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-gray-700 outline outline-1  transition-colors duration-200 hover:bg-zinc-200 hover:outline-2"
    >
      {value}
    </span>
  );
}
