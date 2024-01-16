import Head from "next/head";
import { type GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import NewsCard from "~/components/ui/NewsCard";
import { db } from "~/server/db";
import type { BlogPostWithTags } from "~/utils/types";

type Props = {
  blogPosts: BlogPostWithTags[];
};

function News({ blogPosts }: Props) {
  return (
    <>
      <Head>
        <title>Migotos - All Blog Posts</title>
        <meta
          name="description"
          content="All the blogposts for Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
        />
        <meta property="og:site_name" content="Migotos - All Blog Posts" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content="Migotos - All Blog Posts" />
        <meta
          property="og:description"
          content="All the blogposts for Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://migotos.com/news" />
        <meta
          property="og:image"
          content="https://migotos.com/static/icons/cropped-socialicon-480x480.png"
        />
        <meta property="og:image:alt" content="Migotos logo" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="480" />
        <meta property="og:image:height" content="480" />
        <meta
          property="article:published_time"
          content="2024-01-16T12:18:00+01:00"
        />
        <meta
          property="article:modified_time"
          content="2024-01-16T12:18:00+01:00"
        />
        <meta
          property="article:author"
          content="https://www.facebook.com/eva.d.eide"
        />
      </Head>
      <div className="flex w-full flex-col items-center gap-8">
        <section className="mt-8 flex max-w-6xl flex-col gap-4 px-4 text-center">
          <h1 className="font-playfair text-4xl">
            <em>All Blog Posts</em>
          </h1>
          <p className="text-base text-zinc-600">{`Total posts: ${blogPosts.length}`}</p>
          <p className="text-base leading-loose text-zinc-500">
            Click on the card to read more.
          </p>
        </section>
        <section className="mb-8 grid max-w-6xl gap-6 p-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
          {blogPosts.map((blogPost, idx) => (
            <NewsCard
              key={blogPost.id}
              title={blogPost.title}
              date={blogPost.post_date}
              tags={blogPost.tags.map((tag) => tag.blogposttag.value)}
              image_src={blogPost.image_url}
              id={blogPost.id}
              priority={idx === 0}
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
    include: {
      tags: {
        select: {
          blogposttag: true,
        },
      },
    },
  });

  return {
    props: {
      blogPosts,
    },
  };
}
