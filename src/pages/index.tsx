import Head from "next/head";
import type { GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import LitterProfile from "~/components/LitterProfile";
import NewsCard from "~/components/ui/NewsCard";
import { db } from "~/server/db";
import type { BlogPostWithTags, LitterWithTags } from "~/utils/types";

type Props = {
  blogPosts: BlogPostWithTags[];
  litters: LitterWithTags[];
};

export default function Home({ blogPosts, litters }: Props) {
  return (
    <>
      <Head>
        <title>
          Migotos: Norwegian Forest Cat Cattery based in Oslo, Norway
        </title>
        <meta
          name="description"
          content="Migoto's Norwegian Forest Cat cattery based in Oslo, Norway"
        />
        <meta
          property="og:site_name"
          content="Migotos, Norwegian Forest Cats"
        />
        <meta property="og:locale" content="en_US" />
        <meta
          property="og:title"
          content="Migotos: Norwegian Forest Cat Cattery based in Oslo, Norway"
        />
        <meta
          property="og:description"
          content="Migoto's Norwegian Forest Cat cattery based in Oslo, Norway"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://migotos.com" />
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
      <div className="mt-4 flex flex-col items-center gap-8">
        <h1 className="font-poppins text-3xl">Welcome to Migotos</h1>
        <h3 className="text-2xl text-gray-700">Norwegian Forest Cats</h3>
        <h1 className="font-playfair text-2xl">
          <em>The Latest</em> Litters
        </h1>
        <section className="mb-8 grid max-w-6xl gap-6 p-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
          {litters.map((litter) => (
            <LitterProfile
              key={litter.id}
              id={litter.id}
              name={litter.name}
              post_image={litter.post_image}
              slug={litter.slug}
              tags={litter.Tag.map((tag) => tag.value)}
            />
          ))}
        </section>
        <h1 className="font-playfair text-2xl">
          <em>The Latest</em> Stories
        </h1>
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

        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const lastBlogPosts = await db.blogPost.findMany({
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
    take: 3,
  });

  const lastLitters = await db.litter.findMany({
    orderBy: {
      born: "desc",
    },
    take: 3,
    include: {
      Tag: true,
    },
  });

  return {
    props: {
      blogPosts: lastBlogPosts,
      litters: lastLitters,
    },
  };
}
