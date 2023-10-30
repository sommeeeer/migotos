import { type BlogPost } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import Comment from "~/components/Comment";
import CommentForm from "~/components/CommentForm";
import Tag from "~/components/ui/Tag";
import { db } from "~/server/db";
import type { BlogPostWithTags } from "~/utils/types";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import LoginButton from "~/components/LoginButton";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  blogPost: BlogPostWithTags;
};

function BlogPost({ blogPost }: Props) {
  const { data: session, status } = useSession();
  const {
    isLoading,
    isError,
    isFetching,
    data: comments,
    error,
    refetch,
  } = api.comment.getBlogPostComments.useQuery(blogPost.id);

  return (
    <>
      <div className="flex max-w-5xl flex-col items-center gap-8 px-2 py-4">
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-center text-2xl">{blogPost.title}</h1>
          <div className="flex w-full items-center justify-center gap-2 border-b-2 border-t-zinc-100 text-[#777777]">
            <span className="text-sm">
              {format(new Date(blogPost.post_date), "MMMM d, yyyy")}
            </span>
            <span>•</span>
            <div className="flex gap-0">
              {blogPost.tags.map((tag) => (
                <Tag
                  key={tag.blogposttag.id}
                  className="m-0 p-1 text-sm font-normal text-[#777777]"
                  value={tag.blogposttag.value}
                />
              ))}
            </div>
          </div>
        </header>
        <p className="whitespace-break-spaces p-4 text-base">
          {blogPost.body.trim()}
        </p>
        <Image
          src={blogPost.image_url ?? ""}
          width={384}
          height={167}
          alt={`${blogPost.title} image`}
          quality={100}
        />
        <div className="mb-4 w-full border-t border-zinc-200" />

        <div className="flex flex-col gap-2">
          <h1 className="text-lg uppercase text-[#777777]">
            {comments?.length ?? "0"} comments
          </h1>
          <div className="mt-2 flex max-w-2xl flex-col gap-6">
            <AnimatePresence>
              {isLoading && <LoadingSpinner />}
              {comments?.map((comment) => (
                <Comment
                  key={comment.id}
                  commentId={comment.id}
                  userId={comment.user.id}
                  avatar_src={comment.user?.image}
                  date={comment.createdAt}
                  name={comment.user.name!}
                  message={comment.comment}
                  session={session ?? null}
                  refetchPosts={refetch}
                />
              ))}
            </AnimatePresence>
          </div>

          <hr />
          <div className="mt-8">
            {session ? (
              <CommentForm
                session={session}
                postId={blogPost.id}
                refetchPosts={refetch}
              />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BlogPost;
type Params = { id: string };

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  if (!params?.id) {
    return {
      notFound: true,
    };
  }
  const blogPost = await db.blogPost.findFirst({
    where: {
      id: parseInt(params?.id),
    },
    include: {
      tags: {
        select: {
          blogposttag: true,
        },
      },
    },
  });

  if (!blogPost) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      blogPost,
    },
  };
}

export async function getStaticPaths() {
  const blogPosts = await db.blogPost.findMany();

  const paths = blogPosts.map((blog) => ({
    params: { id: blog.id.toString() },
  }));

  return { paths, fallback: false };
}
