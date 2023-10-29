import { Session } from "next-auth";
import Image from "next/image";
import { MdDeleteForever } from "react-icons/md";
import { api } from "~/utils/api";

interface CommentProps {
  name: string;
  message: string;
  date: string;
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
      console.log("deleted ");
    },
    onError: () => {
      console.log("error");
    },
  });

  function deleteComment(commentId: number) {
    mutate({ id: commentId });
  }

  return (
    <div className="flex flex-col gap-2">
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
          <time>{date}</time>
        </span>
        {session?.user.id === userId && (
          <button
            className="rounded-lg p-1 hover:bg-gray-200"
            onClick={() => deleteComment(commentId)}
          >
            <MdDeleteForever className="h-5 w-5 fill-gray-600" />
          </button>
        )}
      </div>
      <div className="rounded-lg bg-gray-100 px-4 py-3">
        <p className="text-base">{message}</p>
      </div>
    </div>
  );
}
