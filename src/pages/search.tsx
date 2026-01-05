import type { BlogPost, Litter } from '../../prisma/generated/browser';
import { Search } from 'lucide-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Footer from '~/components/Footer';
import { db } from '~/server/db';
import { type CatWithImage } from './cats';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
  searchResults: {
    blogPosts: BlogPost[];
    litters: Litter[];
    cats: CatWithImage[];
  };
};

export default function Home({ searchResults }: Props) {
  const router = useRouter();
  const q = router.query.q as string;

  const blogPostsLength = searchResults.blogPosts.length;
  const littersLength = searchResults.litters.length;
  const catsLength = searchResults.cats.length;

  const total = blogPostsLength + littersLength + catsLength;

  return (
    <>
      <PageHead />
      <div className="mb-10 mt-8 flex max-w-6xl flex-col gap-y-6 px-3">
        <form action="/search" className="relative">
          <Search className="absolute left-0 ml-2 mt-3 h-4 w-4" />
          <input
            type="search"
            aria-label="Search"
            autoComplete="off"
            name="q"
            pattern=".{1,}"
            required
            title="1 characters minimum"
            defaultValue={q}
            className="w-[90%] rounded-md bg-gray-200 py-2 pl-10 pr-4 text-base"
            placeholder="Search..."
          />
        </form>
        <section className="flex flex-col gap-y-10">
          <h1 className="text-2xl font-medium">{`${total} hits on "${q}"`}</h1>
          {catsLength > 0 && (
            <div className="flex flex-col gap-y-4">
              <h2 className="text-xl font-normal">{`${catsLength} hit${catsLength > 1 ? 's' : ''} in cats`}</h2>
              <ul className="flex flex-wrap gap-x-2 gap-y-6 md:gap-x-3">
                {searchResults.cats.map((cat) => (
                  <Link
                    href={`/cats/${cat.slug}`}
                    key={cat.id}
                    className="flex flex-col items-center gap-2 p-2"
                  >
                    <Image
                      src={cat.CatImage[0]?.src ?? ''}
                      blurDataURL={cat.CatImage[0]?.blururl ?? ''}
                      alt={cat.name}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                    <h3>{cat.nickname}</h3>
                  </Link>
                ))}
              </ul>
            </div>
          )}
          {littersLength > 0 && (
            <div className="flex flex-col gap-y-4">
              <h2 className="text-xl font-normal">{`${littersLength} hit${littersLength > 1 ? 's' : ''} in litters`}</h2>
              <ul className="flex flex-wrap gap-x-2 gap-y-6 md:gap-x-3">
                {searchResults.litters.map((litter) => (
                  <Link
                    href={`/kittens/${litter.slug}`}
                    key={litter.id}
                    className="flex flex-col items-center gap-2 p-2"
                  >
                    <div className="relative h-[100px] w-[150px] overflow-hidden rounded-md">
                      {litter.post_image && (
                        <Image
                          src={litter.post_image}
                          alt={litter.name}
                          fill
                          className="object-cover"
                        />
                      )}

                      <h3 className="absolute bottom-0 left-0 z-20 p-2 uppercase text-white">
                        {litter.name}
                      </h3>
                      <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                  </Link>
                ))}
              </ul>
            </div>
          )}
          {blogPostsLength > 0 && (
            <div className="flex flex-col gap-y-4">
              <h2 className="text-xl font-normal">{`${blogPostsLength} hit${blogPostsLength > 1 ? 's' : ''} in blog posts`}</h2>
              <ul className="flex flex-col gap-y-4">
                {searchResults.blogPosts.map((post) => (
                  <Link
                    href={`/news/${post.id}`}
                    key={post.id}
                    className="underline transition-colors duration-300 hover:text-hoverbg"
                  >
                    {post.title}
                  </Link>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const q = context.query.q as string;

  if (!q || q.length < 1) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  await db.searchLog.create({
    data: {
      query: q,
    },
  });

  if (q.length === 1 || q.length === 2) {
    const litterResults = await db.litter.findMany({
      where: {
        OR: [{ name: { contains: q } }],
      },
    });

    let catResults: CatWithImage[] = [];

    if (q.length === 2) {
      catResults = await db.cat.findMany({
        where: {
          OR: [{ name: { contains: q } }],
        },
        include: {
          CatImage: true,
        },
      });
    }

    if (q.length === 1) {
      catResults = await db.cat.findMany({
        where: {
          nickname: {
            startsWith: q,
          },
        },
        include: {
          CatImage: true,
        },
      });
    }

    return {
      props: {
        searchResults: {
          blogPosts: [],
          litters: litterResults,
          cats: catResults,
        },
      },
    };
  }

  let yearQuery = {};

  if (q.length === 4 && !isNaN(Number(q))) {
    yearQuery = {
      born: {
        lte: new Date(`${q}-12-31`),
        gte: new Date(`${q}-01-01`),
      },
    };
  }

  const [catResults, blogPostResults, litterResults, kittenResults] =
    await Promise.all([
      db.cat.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { stamnavn: { contains: q } },
            { description: { contains: q } },
            { nickname: { contains: q } },
            { breeder: { contains: q } },
          ],
        },
        include: {
          CatImage: true,
        },
      }),
      db.blogPost.findMany({
        where: {
          OR: [{ title: { contains: q } }, { body: { contains: q } }],
        },
      }),
      db.litter.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { mother_name: { contains: q } },
            { father_name: { contains: q } },
            { mother_stamnavn: { contains: q } },
            { father_stamnavn: { contains: q } },
            { description: { contains: q } },
            yearQuery,
          ],
        },
      }),
      db.kitten.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { stamnavn: { contains: q } },
            { info: { contains: q } },
          ],
        },
        include: {
          Litter: true,
        },
      }),
    ]);
  const combinedLitters = [
    ...litterResults,
    ...kittenResults.map((kitten) => kitten.Litter),
  ];

  const uniqueLitters = Array.from(
    new Set(combinedLitters.map((litter) => litter.id))
  ).map((id) => combinedLitters.find((litter) => litter.id === id));

  return {
    props: {
      searchResults: {
        blogPosts: blogPostResults,
        litters: uniqueLitters,
        cats: catResults,
      },
    },
  };
};

function PageHead() {
  const router = useRouter();
  const q = router.query.q as string;
  return (
    <Head>
      <title>{`Search results for "${q}" - Migotos`}</title>
      <meta
        name="description"
        content="Migoto's Norwegian Forest Cat cattery based in Oslo, Norway"
      />
      <meta property="og:site_name" content="Migotos, Norwegian Forest Cats" />
      <meta
        property="og:title"
        content="Migotos: Norwegian Forest Cat Cattery based in Oslo, Norway"
      />
      <meta
        property="og:description"
        content="Migoto's Norwegian Forest Cat cattery based in Oslo, Norway"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://migotos.com/search?q=${q}`} />
      <meta
        property="og:image"
        content="https://migotos.com/static/icons/cropped-socialicon-480x480.png"
      />
      <meta property="og:image:alt" content="Migotos logo" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="480" />
      <meta property="og:image:height" content="480" />
    </Head>
  );
}
