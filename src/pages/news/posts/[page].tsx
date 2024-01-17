import type { BlogPost } from "@prisma/client";
import Link from "next/link";
import Pagination from "./PaginationMenu";
import type { GetStaticPathsResult, GetStaticPropsContext } from "next";
import { db } from "~/server/db";

const POSTS_PER_PAGE = 5;

export default function BlogOverviewPage({
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

type Params = {
  page: string;
};

export async function getStaticProps({
  params,
}: GetStaticPropsContext<Params>) {
  const page = parseInt(String(params?.page));

  const blogPostCount = await db.blogPost.count({});

  const totalPages = Math.ceil(blogPostCount / POSTS_PER_PAGE);

  if (page > totalPages) {
    return {
      notFound: true,
    };
  }

  const blogPosts = await db.blogPost.findMany({
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

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

  const totalPages = Math.ceil(blogPostCount / POSTS_PER_PAGE);

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
