import { type BlogPostTag } from '@prisma/client/browser';
import { type GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '~/components/Footer';
import PageBanner from '~/components/PageBanner';
import { db } from '~/server/db';
import { withSuperJSONProps } from '~/utils/superjson-props';

type Props = {
  tags: BlogPostTag[];
};

function Tags({ tags }: Props) {
  return (
    <>
      <PageHead />
      <div className="flex w-full flex-col items-center gap-8">
        <PageBanner title={<em>Categories</em>}>
          <p className="text-sm text-stone-500 sm:text-base">
            Pick a category to see its stories.
          </p>
        </PageBanner>
        <section className="mb-8 flex max-w-3xl flex-wrap justify-center gap-3 px-6 py-4">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/news/tag/${tag.value.toLowerCase()}`}
              className="rounded-full border border-hoverbg/30 bg-white px-5 py-2 text-sm font-medium text-hoverbg transition-colors duration-300 hover:border-hoverbg"
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

export const getStaticProps = withSuperJSONProps(async function (): Promise<
  GetStaticPropsResult<Props>
> {
  const tags = await db.blogPostTag.findMany({});

  return {
    props: {
      tags,
    },
  };
});

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
