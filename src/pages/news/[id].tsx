import { Role, type BlogPost } from '@prisma/client/browser';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next/types';
import React, { useRef, useState } from 'react';
import { FaArrowLeft, FaPaw } from 'react-icons/fa';
import AddImagesButton from '~/components/AddImagesButton';
import Comment from '~/components/Comment';
import CommentForm from '~/components/CommentForm';
import CommentsIconButton from '~/components/CommentsIconButton';
import EditIconButton from '~/components/EditIconButton';
import Footer from '~/components/Footer';
import ImageCarousel from '~/components/ImageCarousel';
import LoginButton from '~/components/LoginButton';
import PageBanner from '~/components/PageBanner';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Tag from '~/components/ui/Tag';
import { IMAGE_QUALITY } from '~/lib/utils';
import { db } from '~/server/db';
import { api } from '~/utils/api';
import type { BlogPostWithTagsAndImages } from '~/utils/types';
import KenTvAppearance from './_custom/KenTvAppearance';
import { withSuperJSONProps } from '~/utils/superjson-props';

type Props = {
  blogPost: BlogPostWithTagsAndImages;
};

const CustomBlogPosts: Record<number, React.FC> = {
  164: KenTvAppearance,
};

function BlogPost({ blogPost }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [carouselOpen, setCarouselOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const {
    isLoading,
    data: comments,
    refetch,
  } = api.comment.getComments.useQuery({
    id: blogPost.id,
    commentType: 'post_id',
  });
  const commentsRef = useRef<HTMLDivElement>(null);

  const convertMarkdownLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(
      linkRegex,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium text-hoverbg underline underline-offset-4">$1</a>'
    );
  };

  const CustomBlogPost = CustomBlogPosts[blogPost.id];

  return (
    <>
      <PageHead blogPost={blogPost} />
      {carouselOpen && (
        <ImageCarousel
          imageIndex={currentImageIndex}
          images={blogPost.images}
          setOpen={setCarouselOpen}
          name={blogPost.title}
        />
      )}
      <PageBanner title={blogPost.title}>
        <Link
          href="/news"
          className="relative order-first mb-2 flex items-center gap-2 text-sm text-stone-500 hover:text-hoverbg"
        >
          <FaArrowLeft aria-hidden />
          All stories
        </Link>
        <p className="text-xs uppercase tracking-wider text-hoverbg">
          {format(new Date(blogPost.post_date), 'MMMM d, yyyy')}
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-2">
          {blogPost.tags.map((tag) => (
            <Tag
              key={tag.blogposttag.id}
              className="m-0 bg-white text-hoverbg hover:bg-stone-200"
              value={tag.blogposttag.value}
            />
          ))}
          <CommentsIconButton
            commentsLength={comments?.length}
            className="h-5 w-5 text-hoverbg"
            commentsRef={commentsRef}
          />
          {session?.user.role === Role.ADMIN && (
            <div className="flex">
              <EditIconButton className="" link={`news/edit/${blogPost.id}`} />
              <AddImagesButton link={`news/images/${blogPost.id}`} />
            </div>
          )}
        </div>
      </PageBanner>
      <div className="flex w-full max-w-3xl flex-col items-center gap-10 px-6 py-10">
        {CustomBlogPost ? (
          <CustomBlogPost />
        ) : (
          <>
            <div
              className="max-w-2xl whitespace-break-spaces text-base leading-loose text-stone-700"
              dangerouslySetInnerHTML={{
                __html: convertMarkdownLinks(blogPost.body.trim()),
              }}
            />
            {blogPost.image_url && (
              <Image
                src={blogPost.image_url}
                width="0"
                height="0"
                sizes="(min-width: 640px) 576px, 100vw"
                className="h-auto max-h-[75vh] w-auto max-w-full rounded-2xl shadow-lg"
                alt={`${blogPost.title} image`}
                quality={IMAGE_QUALITY}
              />
            )}
          </>
        )}
        {blogPost.images.length > 0 && (
          <section className="flex w-full flex-wrap justify-center gap-3 sm:gap-4">
            {blogPost.images.map((img, idx) => {
              return (
                <button
                  type="button"
                  aria-label={`Open picture ${idx + 1}`}
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setCarouselOpen(true);
                  }}
                  key={img.id}
                  className="group relative aspect-square w-[calc(50%-0.375rem)] overflow-hidden rounded-xl shadow-md sm:w-[calc(33.333%-0.667rem)]"
                >
                  <Image
                    src={img.src}
                    alt={`${img.id} picture`}
                    fill
                    sizes="(min-width: 640px) 240px, 50vw"
                    className="rounded-none object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    {...(img.blururl
                      ? { placeholder: 'blur', blurDataURL: img.blururl }
                      : {})}
                  />
                </button>
              );
            })}
          </section>
        )}
        <div className="flex items-center gap-3 text-hoverbg/40">
          <span className="h-px w-16 bg-current" />
          <FaPaw aria-hidden />
          <span className="h-px w-16 bg-current" />
        </div>
        <div className="flex w-full flex-col gap-2" ref={commentsRef}>
          <h2 className="font-playfair text-2xl text-stone-900">
            {comments?.length ?? '0'}{' '}
            {comments?.length === 1 ? 'comment' : 'comments'}
          </h2>
          <div className="mt-2 flex max-w-2xl flex-col gap-6">
            <AnimatePresence>
              {isLoading && <LoadingSpinner />}
              {comments?.map((comment) => (
                <Comment
                  key={comment.id}
                  commentId={comment.id}
                  userId={comment.user.id}
                  avatar_src={comment.user?.image}
                  date={comment.createdAt}
                  name={comment.user.name}
                  message={comment.comment}
                  session={session ?? null}
                  refetchPosts={refetch}
                  email={comment.user.email ?? undefined}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8">
            {session ? (
              <CommentForm
                session={session}
                id={blogPost.id}
                refetchPosts={refetch}
                commentType="post_id"
              />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BlogPost;
type Params = { id: string };

export const getStaticProps = withSuperJSONProps(async function ({
  params,
}: GetStaticPropsContext<Params>): Promise<GetStaticPropsResult<Props>> {
  if (!params?.id || isNaN(Number(params.id))) {
    return {
      notFound: true,
    };
  }
  const blogPost = await db.blogPost.findFirst({
    where: {
      id: parseInt(params?.id),
    },
    include: {
      images: {
        select: {
          id: true,
          src: true,
          height: true,
          width: true,
          blururl: true,
        },
        orderBy: {
          priority: 'asc',
        },
      },
      tags: {
        select: {
          blogposttag: true,
        },
      },
    },
  });

  if (!blogPost) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      blogPost,
    },
  };
});

export async function getStaticPaths() {
  const blogPosts = await db.blogPost.findMany();

  const paths = blogPosts.map((blog) => ({
    params: { id: blog.id.toString() },
  }));

  return { paths, fallback: 'blocking' };
}

function PageHead({ blogPost }: { blogPost: BlogPost }) {
  return (
    <Head>
      <title>{`${blogPost.title} - Migotos`}</title>
      <link rel="canonical" href={`https://migotos.com/news/${blogPost.id}`} />
      <meta name="description" content={blogPost.title} />
      <meta property="og:site_name" content="News - Migotos" />
      <meta property="og:title" content={blogPost.title} />
      <meta property="og:description" content={blogPost.title} />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`https://migotos.com/news/${blogPost.id}`}
      />
      <meta
        property="og:image"
        content={
          blogPost.image_url ?? '/static/icons/cropped-socialicon-480x480.png'
        }
      />
      <meta property="og:image:alt" content="Blogpost post image" />
      <meta
        property="og:image:type"
        content={blogPost.image_url ? '.jpg' : '.png'}
      />
      {!blogPost.image_url && (
        <>
          <meta property="og:image:width" content="480" />
          <meta property="og:image:height" content="480" />
        </>
      )}
      <meta
        property="article:published_time"
        content={blogPost.post_date.toISOString()}
      />
      <meta
        property="article:modified_time"
        content={blogPost.post_date.toISOString()}
      />
      <meta
        property="article:author"
        content="https://www.facebook.com/eva.d.eide"
      />
    </Head>
  );
}
