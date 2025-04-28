import { Role, type BlogPost } from '../../../prisma/generated/browser';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next/types';
import React, { useRef, useState } from 'react';
import AddImagesButton from '~/components/AddImagesButton';
import Comment from '~/components/Comment';
import CommentForm from '~/components/CommentForm';
import CommentsIconButton from '~/components/CommentsIconButton';
import EditIconButton from '~/components/EditIconButton';
import Footer from '~/components/Footer';
import ImageCarousel from '~/components/ImageCarousel';
import LoginButton from '~/components/LoginButton';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Tag from '~/components/ui/Tag';
import { IMAGE_QUALITY } from '~/lib/utils';
import { db } from '~/server/db';
import { api } from '~/utils/api';
import type { BlogPostWithTagsAndImages } from '~/utils/types';
import KenTvAppearance from './_custom/KenTvAppearance';

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
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
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
      <div className="flex max-w-3xl flex-col items-center gap-8 px-3 py-4">
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-center text-xl sm:text-2xl">{blogPost.title}</h1>
          <div className="flex w-full items-center justify-center gap-2 border-b-2 border-t-zinc-100 text-[#777777]">
            <span className="text-sm">
              {format(new Date(blogPost.post_date), 'MMMM d, yyyy')}
            </span>
            <span>•</span>
            <div className="flex items-center gap-0">
              {blogPost.tags.map((tag) => (
                <Tag
                  key={tag.blogposttag.id}
                  className="m-0 p-1 text-sm font-normal text-[#777777]"
                  value={tag.blogposttag.value}
                />
              ))}
              <span>•</span>
              <CommentsIconButton
                commentsLength={comments?.length}
                className="ml-2 h-5 w-5 text-[#777777]"
                commentsRef={commentsRef}
              />
            </div>
            {session?.user.role === Role.ADMIN && (
              <div className="flex">
                <EditIconButton
                  className=""
                  link={`news/edit/${blogPost.id}`}
                />
                <AddImagesButton link={`news/images/${blogPost.id}`} />
              </div>
            )}
          </div>
        </header>
        {CustomBlogPost ? (
          <CustomBlogPost />
        ) : (
          <>
            <div
              className="max-w-2xl whitespace-break-spaces py-2 text-base leading-loose"
              dangerouslySetInnerHTML={{
                __html: convertMarkdownLinks(blogPost.body.trim()),
              }}
            />
            {blogPost.image_url && (
              <Image
                src={blogPost.image_url}
                width="0"
                height="0"
                sizes="100vw"
                className="h-auto w-full max-w-xl"
                alt={`${blogPost.title} image`}
                quality={IMAGE_QUALITY}
              />
            )}
          </>
        )}
        {blogPost.images.length > 0 && (
          <section className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
            {blogPost.images.map((img, idx) => {
              return (
                <picture
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setCarouselOpen(true);
                  }}
                  key={img.id}
                  className="relative h-40 w-40 cursor-pointer shadow-lg sm:h-52 sm:w-52 xl:h-60 xl:w-60"
                >
                  <Image
                    src={img.src}
                    alt={`${img.id} picture`}
                    fill
                    className="rounded-md object-cover object-center"
                    {...(img.blururl
                      ? { placeholder: 'blur', blurDataURL: img.blururl }
                      : {})}
                  />
                </picture>
              );
            })}
          </section>
        )}
        <div className="mb-4 w-full border-t border-zinc-200" />
        <div className="flex w-full flex-col gap-2 px-2" ref={commentsRef}>
          <h1 className="text-lg uppercase text-[#777777]">
            {comments?.length ?? '0'} comments
          </h1>
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

export async function getStaticProps({
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
}

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
