import { type BlogPost } from "@prisma/client";
import { format } from "date-fns";
import router from "next/router";
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
          <h1 className="text-center text-xl">{blogPost.title}</h1>
          <div className="flex gap-5 text-[#777777]">
            <span>{format(new Date(blogPost.post_date), "MMMM d, yyyy")}</span>
            <div className="flex gap-0">
              {blogPost.tags.map((tag) => (
                <Tag
                  key={tag.blogposttag.id as number}
                  onClick={(e) => {
                    e.stopPropagation();
                    void router.push(
                      `/news/tag/${tag.blogposttag.value as string}`,
                    );
                  }}
                  value={tag.blogposttag.value as string}
                />
              ))}
            </div>
          </div>
        </header>
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
