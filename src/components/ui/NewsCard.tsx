import Image from "next/image";
import router from "next/router";
import { format } from "date-fns";
import Tag from "./Tag";

interface Props {
  title: string;
  date: string;
  tags: string[];
  image_src: string | null;
  id: number;
  priority?: boolean;
}

export default function NewsCard({
  title,
  date,
  tags,
  image_src,
  id,
  priority,
}: Props) {
  return (
    <div
      className="flex max-w-sm cursor-pointer flex-col justify-between overflow-hidden rounded bg-slate-50 shadow-md"
      onClick={() => void router.push(`/news/${id}`)}
    >
      {image_src ? (
        <Image
          className="h-[200px] object-cover"
          src={image_src ?? ""}
          alt="Sunset in the mountains"
          width={384}
          height={167}
          quality={100}
          priority={priority}
        />
      ) : (
        <div className="h-[200px] w-full bg-gray-300"></div>
      )}

      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="mb-2 text-xl font-bold">{title}</div>
        <p className="text-gray-600">
          {format(new Date(date), "MMMM d, yyyy")}
        </p>
      </div>
      <div className="self-start px-6 pb-2 pt-4">
        {tags.map((tag) => (
          <Tag
            key={tag}
            className="outline outline-1"
            value={tag}
            color="text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              void router.push(`/news/tag/${tag.toLowerCase()}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
