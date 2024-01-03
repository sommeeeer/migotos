import { formatDistanceToNow } from "date-fns";
import type { Session } from "next-auth";
import Image from "next/image";
import { MdDeleteForever } from "react-icons/md";
import { api } from "~/utils/api";
import LoadingSpinner from "./ui/LoadingSpinner";
import { motion } from "framer-motion";
import { Role } from "@prisma/client";
import { toast } from "./ui/use-toast";
import crypto from "crypto";

interface CommentProps {
  name: string;
  message: string;
  date: Date;
  avatar_src: string | null;
  session: Session | null;
  userId: string;
  commentId: number;
  email?: string;
  refetchPosts: () => void;
}

export default function Comment({
  name,
  message,
  date,
  avatar_src,
  session,
  userId,
  commentId,
  refetchPosts,
  email,
}: CommentProps) {
  const { mutate, isLoading } = api.comment.deleteComment.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Something went wrong while deleting comment. Try again later",
      });
    },
  });

  function deleteComment(commentId: number) {
    mutate({ id: commentId });
  }
  let gravatarUrl = "";
  if (!avatar_src) {
    if (email) {
      const hash = crypto
        .createHash("md5")
        .update(email.trim().toLowerCase())
        .digest("hex");
      gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon&size=32`;
    } else {
      gravatarUrl = "https://www.gravatar.com/avatar/?d=mp&size=32";
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="flex items-center gap-1">
        <Image
          src={avatar_src || gravatarUrl}
          width={32}
          height={32}
          className="rounded-lg"
          alt="User avatar"
        />
        <h1 className="text-lg">{name}</h1>
        <span className="text-sm text-[#777777]">
          <time>{formatDistanceToNow(date)} ago</time>
        </span>
        {(session?.user.id === userId || session?.user.role === Role.ADMIN) && (
          <button
            className="rounded-lg p-1 hover:bg-gray-200"
            onClick={() => deleteComment(commentId)}
          >
            {isLoading && <LoadingSpinner className="h-5 w-5" />}
            {!isLoading && (
              <MdDeleteForever className="h-5 w-5 fill-gray-600" />
            )}
          </button>
        )}
      </div>
      <div className="comment-container relative max-w-[21rem] self-start rounded-lg bg-gray-100 px-3 py-3 sm:max-w-xl md:max-w-3xl">
        <p className="whitespace-normal break-words text-base">{message}</p>
      </div>
    </motion.div>
  );
}
