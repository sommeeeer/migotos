import Image from "next/image";

interface CommentProps {
  name: string;
  message: string;
  date: string;
  avatar_src: string;
}

export default function Comment({
  name,
  message,
  date,
  avatar_src,
}: CommentProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Image
          src={avatar_src}
          width={32}
          height={32}
          className="rounded-lg"
          alt="User avatar"
        />
        <h1 className="text-lg">{name}</h1>
        <span className="text-sm text-[#777777]">
          <time>{date}</time>
        </span>
      </div>
      <div className="rounded-lg bg-gray-100 px-4 py-3">
        <p className="text-base">{message}</p>
      </div>
    </div>
  );
}
