import type { GetStaticProps } from "next/types";
import type { BlogPost } from "@prisma/client";
import Pagination from "./PaginationMenu";
import { db } from "~/server/db";
import Link from "next/link";

/**
 * Constant to determine how many blog posts are shown per page.
 */
const POSTS_PER_PAGE = 5;

/**
 * Blog overview page.
 * Posts are still being rendered by [...slug].tsx.
 */
function BlogOverviewPage({
  blogPosts,
  pagination,
}: {
  blogPosts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
  };
}) {
  return (
    <>
      {/* This component will render out the collection of blog posts passed as a prop. */}
      <section className="mb-10 flex flex-col gap-6">
        {blogPosts.map((blogPost) => (
          <Link
            href={`/news/${blogPost.id}`}
            className="border-b-2"
            key={blogPost.id}
          >
            {blogPost.title} - {blogPost.id}
          </Link>
        ))}
      </section>
      {/* This is our pagination component. */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
        />
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Calculate how many blog posts there are by counting all links starting with 'blog/'.
  const blogPostCount = await db.blogPost.count({});

  // Total count of blog posts in Storyblok.
  const blogPostTotalCount = blogPostCount - 1; // -1 because the blog overview page is also counted.

  // Total number of /blog/posts pages (including index).
  const totalPages = Math.ceil(blogPostTotalCount / POSTS_PER_PAGE);

  // Retrieve blog posts (without content).
  const blogPosts = await db.blogPost.findMany({
    take: POSTS_PER_PAGE,
    skip: 0,
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
        currentPage: 1,
        totalPages: totalPages,
      },
    },
  };
};

export default BlogOverviewPage;
