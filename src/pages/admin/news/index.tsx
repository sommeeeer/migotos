import { type BlogPost, Role } from "@prisma/client";
import { useSession } from "next-auth/react";

import Layout from "../Layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { format } from "date-fns";
import { db } from "~/server/db";
import { type GetServerSidePropsResult } from "next/types";
import Image from "next/image";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import Link from "next/link";
import { Button, buttonVariants } from "~/components/ui/button";
import { MdOutlinePostAdd } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { api } from "~/utils/api";
import router, { useRouter } from "next/router";

type NewsProps = {
  blogposts: BlogPost[];
};

export default function News({ blogposts }: NewsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mutate: mutateDeleteBlogPost } =
    api.blogpost.deleteBlogPost.useMutation({
      onSuccess: () => {
        refreshData();
      },
      onError: () => {
        console.log("Error while trying to delete comment");
      },
    });

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }

  function deleteBlog(id: number) {
    mutateDeleteBlogPost(id);
  }

  const refreshData = () => {
    void router.replace(router.asPath);
  };

  return (
    <Layout>
      <div className="mb-4 flex flex-col items-start gap-4 rounded-lg bg-white p-4 shadow">
        <Link
          className={twMerge(
            buttonVariants(),
            "bg-green-600 hover:bg-green-700",
          )}
          href={"/admin/news/new"}
        >
          <MdOutlinePostAdd className="mr-1 h-4 w-4" />
          New BlogPost
        </Link>
        <Table className="max-w-[95rem]">
          <TableCaption>A list of all blogposts.</TableCaption>
          <TableHeader className="bold bg-gray-50 uppercase text-gray-700">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Body length</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogposts.map((blogpost) => (
              <TableRow key={blogpost.id} className="text-base">
                <TableCell>{blogpost.id}</TableCell>
                <TableCell className="max-w-prose">{blogpost.title}</TableCell>
                <TableCell>{blogpost.body.length}</TableCell>
                <TableCell>
                  <a href={blogpost.image_url ?? ""}>
                    {blogpost.image_url ? (
                      <Image
                        src={blogpost.image_url}
                        width={100}
                        height={100}
                        alt={`${blogpost.title} image`}
                        quality={100}
                      />
                    ) : (
                      <span className="text-lg">NULL</span>
                    )}
                  </a>
                </TableCell>
                <TableCell>
                  {format(blogpost.post_date, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/news/edit/${blogpost.id}`}>
                      <AiFillEdit className="h-8 w-8 cursor-pointer transition-colors duration-200 hover:text-zinc-600" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="hover:-slate-300">
                          <AiFillDelete className="h-8 w-8 transition-colors duration-200 hover:text-zinc-600" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this blogpost and remove the data from the
                            server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteBlog(blogpost.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<NewsProps>
> {
  const blogposts = await db.blogPost.findMany({
    orderBy: {
      post_date: "desc",
    },
  });

  return {
    props: {
      blogposts,
    },
  };
}
