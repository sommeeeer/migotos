import Head from "next/head";
import Link from "next/link";
import type { GetStaticPropsResult } from "next/types";
import Footer from "~/components/Footer";
import LitterProfile from "~/components/LitterProfile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";
import { cn } from "~/lib/utils";
import { db } from "~/server/db";
import type { BlogPostWithTags, LitterWithTags } from "~/utils/types";
import Autoheight from "embla-carousel-auto-height";

type Props = {
  blogPosts: BlogPostWithTags[];
  litters: LitterWithTags[];
};

export default function Home({ blogPosts, litters }: Props) {
  return (
    <>
      <PageHead />
      <div className="mt-4 flex flex-col items-center gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-poppins text-2xl text-gray-800">
            Welcome to Migotos
          </h1>
          <h3 className="text-xl text-gray-700">Norwegian Forest Cats</h3>
        </div>
        <h1 className="font-playfair text-2xl">
          <em>Latest</em> Litters
        </h1>
        <section className="mb-12">
          <Carousel
            plugins={[Autoheight()]}
            className={cn("relative w-full max-w-[352px] md:max-w-96")}
          >
            <CarouselContent>
              {litters.map((litter) => (
                <CarouselItem
                  key={litter.id}
                  className="max-h-[250px] overflow-hidden rounded-md"
                >
                  <LitterProfile
                    key={litter.id}
                    frontPage
                    born={litter.born}
                    id={litter.id}
                    name={litter.name}
                    post_image={litter.post_image}
                    className="h-full w-full"
                    slug={litter.slug}
                    tags={litter.Tag.map((tag) => tag.value)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-1 h-12 w-12 translate-y-[120px] sm:mt-1" />
            <CarouselNext className="absolute right-1 h-12 w-12 translate-y-[120px] sm:mt-1" />
          </Carousel>
        </section>
        <h1 className="mt-4 font-playfair text-2xl">
          <em>Latest</em> Stories
        </h1>
        <section className="mb-8 flex flex-col gap-5 text-ellipsis underline">
          {blogPosts.map((blogPost) => (
            <Link
              className="flex items-center gap-1 px-3"
              key={blogPost.id}
              href={`/news/${blogPost.id}`}
            >
              <p className="text-sm font-semibold sm:text-lg">
                {blogPost.title}
              </p>
            </Link>
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
    take: 5,
  });

  const lastLitters = await db.litter.findMany({
    orderBy: {
      born: "desc",
    },
    take: 9,
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
