import { type BlogPost } from "@prisma/client";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import { db } from "~/server/db";

type Props = {
  blogPost: BlogPost;
};

function BlogPost({ blogPost }: Props) {
  return (
    <>
      <div className="flex w-full flex-col items-center gap-8 bg-zinc-100">
        {blogPost.title}
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
