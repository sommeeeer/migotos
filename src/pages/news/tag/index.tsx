import { type BlogPostTag } from '@prisma/client';
import { type GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '~/components/Footer';
import { db } from '~/server/db';

type Props = {
  tags: BlogPostTag[];
};

function Tags({ tags }: Props) {
  return (
    <>
      <PageHead />
      <div className="flex w-full flex-col items-center gap-8">
        <header>
          <h1 className="mt-8 text-xl">List of categories</h1>
          <h3 className="text-center text-xs text-gray-600">
            Click one to go to there
          </h3>
        </header>
        <section className="mb-8 flex max-w-6xl flex-col gap-4 px-4 text-center">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/news/tag/${tag.value.toLowerCase()}`}
              className="rounded-full bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              {tag.value}
            </Link>
          ))}
        </section>
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const tags = await db.blogPostTag.findMany({});

  return {
    props: {
      tags,
    },
  };
}

export default Tags;

function PageHead() {
  return (
    <Head>
      <title>Categories - Migotots</title>
      <link rel="canonical" href="https://migotos.com/news/tag" />
      <meta name="description" content="All the categories for news posts" />
      <meta
        property="og:site_name"
        content="All the categories for news posts"
      />
      <meta property="og:title" content="Categories - Migotos" />
      <meta
        property="og:description"
        content="All the categories for news posts"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://migotos.com/news/tag/" />
      <meta
        property="og:image"
        content="/static/icons/cropped-socialicon-480x480.png"
      />
      <meta property="og:image:alt" content="Migotos logo" />
      <meta property="og:image:type" content=".png" />

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
