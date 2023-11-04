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
import { AiFillEdit } from "react-icons/ai";
import Link from "next/link";

type NewsProps = {
  blogposts: BlogPost[];
};

// const editSchema = z.object({
//   title: z
//     .string()
//     .min(5, { message: "Title must be atleast 5 characters long." })
//     .max(255, { message: "Title must be less than 255 characters long." }),
//   // body: z
//   //   .string()
//   //   .min(5, { message: "Body must be atleast 5 characters long." })
//   //   .max(2000, { message: "Body must be less than 2000 characters long." }),
//   // post_date: z
//   //   .date()
//   //   .max(new Date(), { message: "Date cannot be in the future." }),
//   // image_url: z.string().url({ message: "Image URL must be a valid URL." }),
// });

export default function News({ blogposts }: NewsProps) {
  const { data: session, status } = useSession();
  // const form = useForm<z.infer<typeof editSchema>>({
  //   resolver: zodResolver(editSchema),
  // });

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }

  // function onEditSubmit(values: z.infer<typeof editSchema>) {
  //   console.log(values);
  // }
  return (
    <Layout>
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
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
