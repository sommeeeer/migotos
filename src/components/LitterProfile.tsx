import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '~/lib/utils';
import { FaArrowRight } from 'react-icons/fa';
import { formatDate } from '~/utils/helpers';

interface LitterProfileProps {
  id: number;
  name: string;
  post_image: string | null;
  slug: string | null;
  tags: string[];
  className?: string;
  frontPage?: boolean;
  born?: Date;
}

export default function LitterProfile({
  id,
  name,
  post_image,
  slug,
  tags,
  className,
  frontPage,
  born,
}: LitterProfileProps) {
  return (
    <motion.div
      className={cn(
        'relative flex h-[216px] w-[352px] flex-col overflow-hidden rounded-md bg-zinc-400 shadow-md',
        className
      )}
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <Link href={`kittens/${slug}`} style={{ height: '100%' }}>
        <FaArrowRight className="absolute right-0 top-0 z-10 m-4 text-3xl text-white" />
        {post_image && (
          <Image
            key={id}
            src={post_image}
            alt={name}
            width={650}
            height={400}
            style={{ height: '100%', objectFit: 'cover' }}
          />
        )}
        {!frontPage && (
          <div className="absolute bottom-0 z-10 p-4 font-playfair uppercase tracking-wider text-white">
            <h3 className="text-sm">{tags.join(', ')}</h3>
            <h1 className="text-lg">{name}</h1>
          </div>
        )}
        {frontPage && born && (
          <div className="absolute bottom-0 z-10 p-4 font-playfair tracking-wider text-white">
            <h3 className="font-medium">{`${name}-Litter ${formatDate(born?.toISOString())}`}</h3>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
      </Link>
    </motion.div>
  );
}
