import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import type { z } from 'zod';
import { commentSchema } from '~/lib/validators/comment';
import ErrorParagraph from './ui/ErrorParagraph';
import type { Session } from 'next-auth';
import Image from 'next/image';
import { api } from '~/utils/api';
import LoadingSpinner from './ui/LoadingSpinner';
import type { CommentType } from '~/utils/types';
import { toast } from './ui/use-toast';
import { createGravatarURL } from '~/utils/helpers';

interface CommentFormProps {
  session: Session;
  id: number;
  refetchPosts: () => void;
  commentType: z.infer<typeof CommentType>;
}

export default function CommentForm({
  id,
  session,
  refetchPosts,
  commentType,
}: CommentFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
  });

  const { mutate, isLoading } = api.comment.addComment.useMutation({
    onSuccess: () => {
      reset();
      refetchPosts();
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Something went wrong while adding new comment. Please try again.',
      });
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof commentSchema>> = (data) =>
    mutate({ id, commentType, comment: data.message });
  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-lg">Logged in as:</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">
            {session.user.name ? session.user.name : session.user.email}
          </p>
          <Image
            src={
              session.user.image ||
              createGravatarURL(session?.user?.email ?? undefined)
            }
            width={32}
            height={32}
            className="rounded-lg"
            alt="User avatar"
          />
        </div>
      </div>
      <h3 className="mb-2 text-base">LEAVE A REPLY</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <TextareaAutosize
          className="h-14 max-w-3xl rounded-sm border-2 border-solid border-gray-200 px-4 py-4 text-base"
          {...register('message')}
          placeholder="Message"
          minRows={4}
          disabled={isLoading}
        />
        {errors.message?.message && (
          <ErrorParagraph message={errors.message?.message} />
        )}
        <button
          className="h-14 w-4/6 max-w-xs cursor-pointer rounded-md border-2 border-solid border-gray-200 p-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-3" />
              Loading...
            </>
          ) : (
            'Post Comment'
          )}
        </button>
      </form>
    </>
  );
}
