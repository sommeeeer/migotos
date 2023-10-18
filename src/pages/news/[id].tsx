import { type BlogPost } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import Tag from "~/components/ui/Tag";
import { db } from "~/server/db";
import type { BlogPostWithTags } from "~/utils/types";

type Props = {
  blogPost: BlogPostWithTags;
};

function BlogPost({ blogPost }: Props) {
  return (
    <>
      <div className="flex w-full flex-col items-center gap-8 px-2 py-4">
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
