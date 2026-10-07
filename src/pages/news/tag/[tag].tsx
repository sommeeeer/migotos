import { type GetStaticPropsResult, type GetStaticPropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Footer from '~/components/Footer';
import PageBanner from '~/components/PageBanner';
import NewsCard from '~/components/ui/NewsCard';
import { db } from '~/server/db';
import { capitalizeString } from '~/utils/helpers';
import type { BlogPostWithTags } from '~/utils/types';
import { withSuperJSONProps } from '~/utils/superjson-props';

type Props = {
  blogPosts: BlogPostWithTags[];
};

function TagPage({ blogPosts }: Props) {
  const router = useRouter();
  const { tag: title } = router.query;

  return (
    <>
      <PageHead title={title as string} />
      <div className="flex w-full flex-col items-center gap-8">
        <PageBanner title={<em className="capitalize">{title}</em>}>
          <p className="text-xs uppercase tracking-wider text-hoverbg">
            {blogPosts.length} {blogPosts.length === 1 ? 'post' : 'posts'}
          </p>
          <Link
            href="/news/tag"
            className="relative text-sm text-stone-500 underline underline-offset-4 hover:text-hoverbg"
          >
            All categories
          </Link>
        </PageBanner>
        <section className="mb-8 grid w-full max-w-6xl justify-items-center gap-6 px-6 py-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
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

export default TagPage;

type Params = { tag: string };

export const getStaticProps = withSuperJSONProps(async function ({
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
    orderBy: {
      post_date: 'desc',
    },
  });

  if (!blogPosts.length) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      blogPosts,
    },
  };
});

export async function getStaticPaths() {
  const tags = await db.blogPostTag.findMany({
    select: {
      value: true,
    },
  });

  const paths = tags.map((tag) => ({
    params: { tag: tag.value.toLowerCase() },
  }));

  return { paths, fallback: 'blocking' };
}

function PageHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{`${capitalizeString(title)} - Migotos`}</title>
      <link rel="canonical" href={`https://migotos.com/news/tag/${title}`} />
      <meta name="description" content={title} />
      <meta
        property="og:site_name"
        content={`${capitalizeString(title)} - Migotos`}
      />
      <meta
        property="og:title"
        content={`${capitalizeString(title)} Category`}
      />
      <meta
        property="og:description"
        content={`${capitalizeString(title)} Category`}
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`https://migotos.com/news/tag/${title}`}
      />
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
