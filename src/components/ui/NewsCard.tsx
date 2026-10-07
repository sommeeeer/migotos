import Image from 'next/image';
import router from 'next/router';
import { format } from 'date-fns';
import { FaPaw } from 'react-icons/fa';
import Tag from './Tag';
import { IMAGE_QUALITY } from '~/lib/utils';

interface Props {
  title: string;
  date: Date;
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
      className="group flex w-full max-w-sm cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-stone-100 transition-shadow duration-300 hover:shadow-xl"
      onClick={() => void router.push(`/news/${id}`)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#faf6f0]">
        {image_src ? (
          <Image
            className="rounded-none object-cover transition-transform duration-500 group-hover:scale-105"
            src={image_src}
            alt={title}
            fill
            sizes="(min-width: 768px) 384px, 100vw"
            quality={IMAGE_QUALITY}
            priority={priority}
          />
        ) : (
          <FaPaw
            aria-hidden
            className="absolute inset-0 m-auto text-6xl text-hoverbg/10"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 px-6 pb-4 pt-5">
        <p className="text-xs uppercase tracking-wider text-hoverbg">
          {format(date, 'MMMM d, yyyy')}
        </p>
        <h2 className="font-playfair text-xl text-stone-900 underline-offset-4 group-hover:underline">
          {title}
        </h2>
      </div>
      {tags.length > 0 && (
        <div className="mt-auto px-6 pb-3">
          {tags.map((tag) => (
            <Tag
              key={tag}
              className="bg-[#faf6f0] text-hoverbg hover:bg-stone-200"
              value={tag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
