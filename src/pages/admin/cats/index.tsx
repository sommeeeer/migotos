import { useRouter } from "next/router";
import { FaCat } from "react-icons/fa";
import { GrGallery } from "react-icons/gr";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { format } from "date-fns";
import { type Cat } from "../../../../prisma/generated/browser";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next/types';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { db } from '~/server/db';
import { buttonVariants } from '~/components/ui/button';
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
} from '~/components/ui/alert-dialog';
import { api } from '~/utils/api';
import { toast } from '~/components/ui/use-toast';
import AdminLayout from '../AdminLayout';
import { checkAdminSession } from '~/server/helpers';
import { Loader2 } from 'lucide-react';

type CatsProps = {
  cats: Pick<
    Cat,
    | 'id'
    | 'name'
    | 'nickname'
    | 'stamnavn'
    | 'pedigreeurl'
    | 'birth'
    | 'gender'
    | 'fertile'
    | 'breeder'
  >[];
};

export default function Cats({ cats }: CatsProps) {
  const router = useRouter();
  const {
    mutate: mutateDeleteCat,
    isLoading: isLoadingDeleteCat,
    variables: mutateCatId,
  } = api.cat.deleteCat.useMutation({
    onSuccess: () => {
      toast({
        variant: 'default',
        title: 'Success',
        color: 'green',
        description: 'Cat deleted successfully.',
      });
      void router.replace(router.asPath);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while trying to update cat.',
      });
    },
  });
  function deleteCat(id: number) {
    mutateDeleteCat(id);
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex flex-col items-start gap-4 rounded-lg bg-white p-4 shadow">
        <Link className={twMerge(buttonVariants())} href={'/admin/cats/new'}>
          <FaCat className="mr-1 h-4 w-4" />
          New Cat
        </Link>
        <Table className="max-w-[115rem]">
          <TableCaption>A list of all cats.</TableCaption>
          <TableHeader className="bold bg-gray-50 uppercase text-gray-700">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead>Fargekode</TableHead>
              <TableHead>PedigreeURL</TableHead>
              <TableHead>Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Fertile</TableHead>
              <TableHead>Breeder</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cats.map((cat) => (
              <TableRow key={cat.id} className="text-base">
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.nickname}</TableCell>
                <TableCell>{cat.stamnavn}</TableCell>
                <TableCell className="max-w-[10rem]">
                  {cat.pedigreeurl ? (
                    <a
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href={cat.pedigreeurl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Link
                    </a>
                  ) : (
                    <p>NONE</p>
                  )}
                </TableCell>
                <TableCell>{format(cat.birth, 'dd.MM.yyyy')}</TableCell>
                <TableCell>{cat.gender}</TableCell>
                <TableCell>{cat.fertile ? 'Yes' : 'No'}</TableCell>
                <TableCell>{cat.breeder}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/cats/edit/${cat.id}`}>
                      <AiFillEdit className="h-8 w-8 cursor-pointer transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
                    </Link>
                    <Link href={`/admin/cats/images/${cat.id}`}>
                      <GrGallery className="h-8 w-8 cursor-pointer transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="hover:-slate-300">
                          {isLoadingDeleteCat && cat.id === mutateCatId ? (
                            <Loader2 className="size-8 animate-spin" />
                          ) : (
                            <AiFillDelete className="size-8 transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this cat and remove the data from the server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteCat(cat.id)}
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
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<CatsProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }
  const cats = await db.cat.findMany({
    orderBy: {
      birth: 'desc',
    },
    select: {
      id: true,
      name: true,
      nickname: true,
      stamnavn: true,
      pedigreeurl: true,
      birth: true,
      gender: true,
      fertile: true,
      breeder: true,
    },
  });

  return {
    props: {
      cats,
    },
  };
}
