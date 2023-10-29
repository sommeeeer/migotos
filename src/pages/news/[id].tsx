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

type Props = {
  blogPost: BlogPostWithTags;
};

function BlogPost({ blogPost }: Props) {
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
        <div className="border-t border-zinc-200 w-full mb-4" />

        <div className="flex flex-col gap-2">
          <h1 className="text-lg uppercase text-[#777777]">0 comments</h1>
          <Comment
            avatar_src="https://lh3.googleusercontent.com/a/ACg8ocJdW6dUWFUd-4ddyaznE6Ny8sQQSNp2K9Ie9F6chWAH=s96-c"
            date="December 3, 2009 at 9:47 am"
            name="Sean Platt"
            message="These are rules of page turning fiction, which is also magnetic copy;
        drawing them in close and selling them on turning the page and spending
        their time. When I first started writing, flowery language was my
        achilles heal. And while it still has its place, sales copy isn
        t it."
          />

          <hr />
          <div className="mt-8">
            <CommentForm />
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
