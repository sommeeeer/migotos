import { formatDistanceToNow } from "date-fns";
import type { Session } from "next-auth";
import Image from "next/image";
import { MdDeleteForever } from "react-icons/md";
import { api } from "~/utils/api";
import LoadingSpinner from "./ui/LoadingSpinner";
import { motion } from "framer-motion";
import { useState } from "react";

interface CommentProps {
  name: string;
  message: string;
  date: Date;
  avatar_src: string | null;
  session: Session | null;
  userId: string;
  commentId: number;
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
}: CommentProps) {
  const { mutate, isLoading } = api.comment.deleteComment.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
    onError: () => {
      console.log("Error while trying to delete comment");
    },
  });

  function deleteComment(commentId: number) {
    mutate({ id: commentId });
  }

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="flex items-center gap-1">
        {avatar_src && (
          <Image
            src={avatar_src}
            width={32}
            height={32}
            className="rounded-lg"
            alt="User avatar"
          />
        )}
        <h1 className="text-lg">{name}</h1>
        <span className="text-sm text-[#777777]">
          <time>{formatDistanceToNow(date)} ago</time>
        </span>
        {session?.user.id === userId && (
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
      <div className="max-w-sm sm:max-w-lg md:max-w-xl rounded-lg bg-gray-100 px-4 py-3">
        <p className="whitespace-normal break-words text-base">
          {message}
        </p>
      </div>
    </motion.div>
  );
}
