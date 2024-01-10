import type { Litter } from "@prisma/client";

import AdminLayout from "../AdminLayout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { db } from "~/server/db";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next/types";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
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
import { GrGallery } from "react-icons/gr";
import { format } from "date-fns";
import { checkAdminSession } from "~/server/helpers";
import { BiSolidCat } from "react-icons/bi";
import { api } from "~/utils/api";
import { toast } from "~/components/ui/use-toast";
import { useRouter } from "next/router";

type LittersProps = {
  litters: Litter[];
};

export default function Litters({ litters }: LittersProps) {
  const router = useRouter();
  const { mutate: mutateDeleteLitter } = api.litter.deleteLitter.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Litter deleted successfully.",
      });
      void router.replace(router.asPath);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while trying to update cat.",
      });
    },
  });

  function deleteLitter(id: number) {
    mutateDeleteLitter(id);
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex flex-col items-start gap-4 rounded-lg bg-white p-4 shadow">
        <Link
          className={twMerge(
            buttonVariants(),
            "bg-green-700 hover:bg-green-800",
          )}
          href={"/admin/litters/new"}
        >
          <BiSolidCat className="mr-1 h-4 w-4" />
          New Litter
        </Link>
        <Table className="max-w-[115rem]">
          <TableCaption>A list of all litters.</TableCaption>
          <TableHeader className="bold bg-gray-50 uppercase text-gray-700">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Born</TableHead>
              <TableHead>Mother Name</TableHead>
              <TableHead>Father Name</TableHead>
              <TableHead>PedigreeURL</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {litters.map((litter) => (
              <TableRow key={litter.id} className="text-base">
                <TableCell>{litter.name}</TableCell>
                <TableCell>{format(litter.born, "dd.MM.yyyy")}</TableCell>
                <TableCell className="max-w-[10rem]">
                  {litter.mother_name}
                </TableCell>
                <TableCell className="max-w-[15rem]">
                  {litter.father_name}
                </TableCell>
                <TableCell className="max-w-[15rem]">
                  {litter.pedigreeurl ? (
                    <a
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href={litter.pedigreeurl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Link
                    </a>
                  ) : (
                    <p>NONE</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/litters/edit/${litter.id}`}>
                      <AiFillEdit className="h-8 w-8 cursor-pointer transition-colors duration-200 hover:text-zinc-600" />
                    </Link>
                    <Link href={`/admin/litters/images/${litter.id}`}>
                      <GrGallery className="h-8 w-8 cursor-pointer transition-colors duration-200 hover:text-zinc-600" />
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
                            delete this litter and remove the data from the
                            server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteLitter(litter.id)}
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
    </AdminLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<LittersProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }
  const litters = await db.litter.findMany({
    orderBy: {
      born: "desc",
    },
  });

  return {
    props: {
      litters,
    },
  };
}
