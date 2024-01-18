import Head from "next/head";
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next/types";
import Footer from "~/components/Footer";
import PaginationMenu from "~/components/PaginationMenu";
import NewsCard from "~/components/ui/NewsCard";
import { db } from "~/server/db";
import type { BlogPostWithTags } from "~/utils/types";

type Props = {
  blogPosts: BlogPostWithTags[];
  pagination: {
    currentPage: number;
    totalPages: number;
  };
};

function News({ blogPosts, pagination }: Props) {
  return (
    <>
      <PageHead />
      <div className="flex w-full flex-col items-center gap-8">
        <section className="mt-8 flex max-w-6xl flex-col gap-4 px-4 text-center">
          <h1 className="font-playfair text-lg tracking-wider sm:text-xl md:text-2xl">
            <em>All Blog Posts</em>
          </h1>
          <p className="text-xs text-gray-500">
            Showing page {pagination.currentPage + 1} of {pagination.totalPages}
          </p>
          <p className="text-base leading-loose text-zinc-500">
            Click on the card to read more.
          </p>
        </section>
        <section className="grid max-w-6xl gap-6 p-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
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
        <PaginationMenu
          className="mb-8"
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
        />
      </div>
      <Footer />
    </>
  );
}
export default News;

type Params = {
  page: string;
};

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  const page = parseInt(String(params?.page));

  const blogPostCount = await db.blogPost.count({});

  const totalPages = Math.ceil(blogPostCount / Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE));

  if (page > totalPages) {
    return {
      notFound: true,
    };
  }

  const blogPosts = await db.blogPost.findMany({
    skip: (page - 1) * Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE),
    take: Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE),
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

  if (blogPosts.length === 0) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      blogPosts,
      pagination: {
        currentPage: page,
        totalPages,
      },
    },
  };
}

export async function getStaticPaths() {
  const blogPostCount = await db.blogPost.count();

  const totalPages = Math.ceil(blogPostCount / Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE));

  const staticPathsResult: GetStaticPathsResult = {
    paths: [],
    fallback: "blocking",
  };

  for (let i = 2; i <= totalPages; i++) {
    staticPathsResult.paths.push({
      params: { page: i.toString() },
    });
  }

  return staticPathsResult;
}

function PageHead() {
  return (
    <Head>
      <title>News - Migotos</title>
      <link rel="canonical" href="https://migotos.com/news" />
      <meta
        name="description"
        content="All the blogposts for Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
      />
      <meta property="og:site_name" content="News - Migotos" />
      <meta property="og:title" content="News - Migotos" />
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
  );
}
