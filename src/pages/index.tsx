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
