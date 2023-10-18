import { type GetStaticPropsResult, type GetStaticPropsContext } from "next";
import { useParams } from "next/navigation";
import Footer from "~/components/Footer";
import NewsCard from "~/components/ui/NewsCard";
import { db } from "~/server/db";
import type { BlogPostWithTags } from "~/utils/types";

type Props = {
  blogPosts: BlogPostWithTags[];
};

function TagPage({ blogPosts }: Props) {
  const params = useParams();
  const title = params?.tag;
  return (
    <>
      <div className="flex w-full flex-col items-center gap-8 bg-zinc-100">
        <section className="mt-16 flex max-w-6xl flex-col gap-4 px-4 text-center">
          <h1 className="font-playfair text-4xl">
            <em className="capitalize">{title}</em>
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
              tags={blogPost.tags.map((tag) => tag.blogposttag.value as string)}
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

export default TagPage;

type Params = { tag: string };

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  const tag = params?.tag;

  if (!tag) {
    return {
      notFound: true,
    };
  }

  const blogPosts = await db.blogPost.findMany({
    where: {
      tags: {
        some: {
          blogposttag: {
            value: tag,
          },
        },
      },
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

export async function getStaticPaths() {
  const tags = await db.blogPostTag.findMany({
    select: {
      value: true,
    },
  });

  const paths = tags.map((tag) => ({
    params: { tag: tag.value.toLowerCase() },
  }));

  return { paths, fallback: false };
}
