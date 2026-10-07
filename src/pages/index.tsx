import { format } from 'date-fns';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetStaticPropsResult } from 'next/types';
import type { ReactNode } from 'react';
import { FaArrowRight, FaPaw } from 'react-icons/fa';
import Feedback from '~/components/Feedback';
import Footer from '~/components/Footer';
import { IMAGE_QUALITY, cn } from '~/lib/utils';
import type { CatWithImage } from '~/pages/cats';
import { db } from '~/server/db';
import { capitalizeString, formatDate } from '~/utils/helpers';
import type { BlogPostWithTags, LitterWithTags } from '~/utils/types';
import { withSuperJSONProps } from '~/utils/superjson-props';

type Props = {
  blogPosts: BlogPostWithTags[];
  litters: LitterWithTags[];
  cats: CatWithImage[];
};

export default function Home({ blogPosts, litters, cats }: Props) {
  const heroLitter = litters.find((litter) => litter.post_image);
  const [featuredPost, ...otherPosts] = blogPosts;

  return (
    <>
      <PageHead />
      <section className="relative w-full overflow-hidden bg-[#faf6f0]">
        <FaPaw
          aria-hidden
          className="absolute -left-6 top-10 -rotate-12 text-[9rem] text-hoverbg/5"
        />
        <FaPaw
          aria-hidden
          className="absolute bottom-6 left-1/3 hidden rotate-[20deg] text-6xl text-hoverbg/5 md:block"
        />
        <FaPaw
          aria-hidden
          className="absolute -right-8 -top-8 rotate-[30deg] text-[11rem] text-hoverbg/5"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-2 md:py-20">
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-hoverbg">
              <FaPaw aria-hidden />
              Oslo, Norway · Since 2006
            </p>
            <h1 className="font-playfair text-4xl leading-tight text-stone-900 sm:text-5xl sm:leading-tight">
              Welcome to <em>Migoto’s</em>
              <br />
              Norwegian Forest Cats
            </h1>
            <p className="max-w-md text-base leading-8 text-stone-600">
              A family driven cattery where every cat is part of the family. Our
              kittens grow up with lots of humans and activity around them from
              day one.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/kittens"
                className="rounded-full bg-hoverbg px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-stone-800"
              >
                See the kittens
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-hoverbg/30 bg-white px-6 py-3 text-sm font-medium text-hoverbg transition-colors duration-300 hover:border-hoverbg"
              >
                About the cattery
              </Link>
            </div>
            {cats.length > 0 && (
              <Link href="/cats" className="group mt-2 flex items-center gap-4">
                <span className="flex -space-x-3">
                  {cats.slice(0, 5).map((cat) => (
                    <CatPortrait
                      key={cat.id}
                      cat={cat}
                      size={48}
                      className="ring-2 ring-[#faf6f0]"
                    />
                  ))}
                </span>
                <span className="text-sm text-stone-600 underline-offset-4 group-hover:underline">
                  Meet the family
                </span>
              </Link>
            )}
          </div>
          {heroLitter?.post_image && (
            <Link
              href={`/kittens/${heroLitter.slug}`}
              className="group relative mx-auto block aspect-[4/3] w-full max-w-xl md:rotate-1"
            >
              <span className="absolute inset-0 -rotate-3 rounded-[2rem] bg-hoverbg/10" />
              <span className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-xl">
                <Image
                  src={heroLitter.post_image}
                  alt={`A kitten from the ${heroLitter.name}-litter`}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={IMAGE_QUALITY}
                  className="rounded-none object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              <span className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-lg sm:left-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#faf6f0] text-hoverbg">
                  <FaPaw aria-hidden />
                </span>
                <span className="text-left text-xs leading-tight text-stone-500">
                  <strong className="block text-sm font-medium text-stone-900">
                    Our newest litter
                  </strong>
                  {heroLitter.name}-Litter,{' '}
                  {formatDate(heroLitter.born.toISOString())}
                </span>
              </span>
            </Link>
          )}
        </div>
      </section>

      <section className="flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-20">
        <SectionHeading
          title={
            <>
              <em>Latest</em> Litters
            </>
          }
          text="Follow our kittens week by week as they grow up."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {litters.map((litter, idx) => (
            <Link
              key={litter.id}
              href={`/kittens/${litter.slug}`}
              className={cn(
                'group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-stone-100 transition-shadow duration-300 hover:shadow-xl',
                idx > 2 && 'hidden sm:block'
              )}
            >
              <div className="relative aspect-[3/2] bg-stone-200">
                {litter.post_image && (
                  <Image
                    src={litter.post_image}
                    alt={`${litter.name}-litter`}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    quality={IMAGE_QUALITY}
                    className="rounded-none object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <h3 className="font-playfair text-xl text-stone-900">
                    {litter.name}-Litter
                  </h3>
                  <p className="text-sm text-stone-500">
                    {capitalizeString(formatDate(litter.born.toISOString()))}
                  </p>
                </div>
                <FaArrowRight
                  aria-hidden
                  className="shrink-0 text-hoverbg/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-hoverbg"
                />
              </div>
            </Link>
          ))}
        </div>
        <MoreLink href="/kittens">All litters</MoreLink>
      </section>

      {cats.length > 0 && (
        <section className="flex w-full flex-col items-center bg-[#faf6f0]">
          <div className="flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-20">
            <SectionHeading
              title={
                <>
                  <em>Meet</em> Our Cats
                </>
              }
              text="Some of the breeding cats behind the Migoto’s kittens."
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/cats/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <CatPortrait
                    cat={cat}
                    size={144}
                    className="shadow-md ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
                  />
                  <div>
                    <h3 className="font-playfair text-xl text-stone-900">
                      {cat.nickname}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-stone-500">
                      {cat.stamnavn}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <MoreLink href="/cats">All our cats</MoreLink>
          </div>
        </section>
      )}

      {featuredPost && (
        <section className="flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-20">
          <SectionHeading
            title={
              <>
                <em>Latest</em> Stories
              </>
            }
            text="Show results, new arrivals and other news from the cattery."
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <Link
              href={`/news/${featuredPost.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-stone-100 transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] bg-stone-200">
                {featuredPost.image_url && (
                  <Image
                    src={featuredPost.image_url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 550px, 100vw"
                    quality={IMAGE_QUALITY}
                    className="rounded-none object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2 p-6">
                <p className="text-xs uppercase tracking-wider text-hoverbg">
                  {format(featuredPost.post_date, 'MMMM d, yyyy')}
                </p>
                <h3 className="font-playfair text-2xl text-stone-900 underline-offset-4 group-hover:underline">
                  {featuredPost.title}
                </h3>
              </div>
            </Link>
            <ul className="flex flex-col divide-y divide-stone-100">
              {otherPosts.map((blogPost) => (
                <li key={blogPost.id}>
                  <Link
                    href={`/news/${blogPost.id}`}
                    className="group flex items-center gap-4 py-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-200 sm:h-24 sm:w-24">
                      {blogPost.image_url && (
                        <Image
                          src={blogPost.image_url}
                          alt=""
                          fill
                          sizes="96px"
                          quality={IMAGE_QUALITY}
                          className="rounded-none object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs uppercase tracking-wider text-hoverbg">
                        {format(blogPost.post_date, 'MMMM d, yyyy')}
                      </p>
                      <h3 className="line-clamp-2 font-medium text-stone-900 underline-offset-4 group-hover:underline sm:text-lg">
                        {blogPost.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <MoreLink href="/news">All stories</MoreLink>
        </section>
      )}

      <div className="mb-12 flex flex-col gap-3 px-4 text-center">
        <span className="text-sm text-gray-800">
          Got any questions or feedback for our website?
        </span>
        <Feedback />
      </div>
      <Footer />
    </>
  );
}

function SectionHeading({ title, text }: { title: ReactNode; text: string }) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-3 text-hoverbg/40">
        <span className="h-px w-10 bg-current" />
        <FaPaw aria-hidden />
        <span className="h-px w-10 bg-current" />
      </div>
      <h2 className="font-playfair text-3xl text-stone-900 sm:text-4xl">
        {title}
      </h2>
      <p className="text-sm text-stone-500 sm:text-base">{text}</p>
    </header>
  );
}

function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 self-center rounded-full border border-hoverbg/30 bg-white px-6 py-3 text-sm font-medium text-hoverbg transition-colors duration-300 hover:border-hoverbg"
    >
      {children}
      <FaArrowRight
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}

function CatPortrait({
  cat,
  size,
  className,
}: {
  cat: CatWithImage;
  size: number;
  className?: string;
}) {
  const image = cat.CatImage[0];
  if (!image) {
    return (
      <span
        style={{ width: size, height: size }}
        className={cn('block rounded-full bg-stone-200', className)}
      />
    );
  }
  return (
    <Image
      src={image.src}
      alt={cat.nickname}
      width={size}
      height={size}
      quality={IMAGE_QUALITY}
      className={cn('rounded-full object-cover', className)}
      {...(image.blururl
        ? { placeholder: 'blur' as const, blurDataURL: image.blururl }
        : {})}
    />
  );
}

export const getStaticProps = withSuperJSONProps(async function (): Promise<
  GetStaticPropsResult<Props>
> {
  const [lastBlogPosts, lastLitters, cats] = await Promise.all([
    db.blogPost.findMany({
      orderBy: {
        post_date: 'desc',
      },
      include: {
        tags: {
          select: {
            blogposttag: true,
          },
        },
      },
      take: 5,
    }),
    db.litter.findMany({
      orderBy: {
        born: 'desc',
      },
      take: 6,
      include: {
        Tag: true,
      },
    }),
    db.cat.findMany({
      where: {
        fertile: true,
      },
      orderBy: {
        birth: 'desc',
      },
      take: 8,
      include: {
        CatImage: {
          take: 1,
        },
      },
    }),
  ]);

  return {
    props: {
      blogPosts: lastBlogPosts,
      litters: lastLitters,
      cats,
    },
  };
});

function PageHead() {
  return (
    <Head>
      <title>Migotos: Norwegian Forest Cat Cattery based in Oslo, Norway</title>
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
  );
}
