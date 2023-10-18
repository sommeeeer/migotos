import { type BlogPost } from "@prisma/client";
import { type GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import NewsCard from "~/components/ui/NewsCard";
import { db } from "~/server/db";

type Props = {
  blogPosts: BlogPost[];
};

function News({ blogPosts }: Props) {
  return (
    <>
      <div className="flex w-full flex-col items-center bg-zinc-100 gap-8">
        <section className="mt-16 flex max-w-6xl flex-col gap-4 px-4 text-center">
          <h1 className="font-playfair text-4xl">
            <em>All Blog Posts</em>
          </h1>
          <p className="text-base uppercase text-zinc-600"></p>
          <p className="text-base leading-loose text-zinc-500">
            Click on the card to read more.
          </p>
        </section>
        <section className="mb-8 grid max-w-6xl gap-6 p-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
          {blogPosts.map((blogPost) => (
            <NewsCard
              key={blogPost.id}
              title={blogPost.title}
              date={blogPost.post_date.toDateString()}
              tags={["Testing", "Super"]}
              image_src={blogPost.image_url}
              id={blogPost.id}
            />
          ))}
        </section>
      </div>
      <Footer />
    </>
  );
}
export default News;

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const blogPosts = await db.blogPost.findMany({
    orderBy: {
      post_date: "desc",
    },
  });

  return {
    props: {
      blogPosts,
    },
  };
}
