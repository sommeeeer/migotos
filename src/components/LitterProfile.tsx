import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface LitterProfileProps {
  id: number;
  name: string;
  post_image: string | null;
  slug: string;
  tags: string[];
}

export default function LitterProfile({
  id,
  name,
  post_image,
  slug,
  tags,
}: LitterProfileProps) {
  return (
    <motion.div
      className="relative flex h-[216px] w-[352px] flex-col overflow-hidden rounded-md bg-zinc-400"
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <Link href={`kittens/${slug}`} style={{ height: "100%" }}>
        {post_image && (
          <Image
            key={id}
            src={post_image}
            alt={name}
            width={650}
            height={400}
            style={{ height: "100%", objectFit: "cover" }}
          />
        )}
        <div className="absolute bottom-0 z-10 p-4 font-playfair uppercase tracking-wider text-white">
          <h3 className="text-sm">{tags.join(", ")}</h3>
          <h1 className="text-lg">{name}</h1>
        </div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </Link>
    </motion.div>
  );
}
