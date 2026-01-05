import { type Prisma, Role } from '../../../../prisma/generated/browser';
import AdminLayout from '../AdminLayout';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { db } from '~/server/db';
import { format } from 'date-fns';
import { AiFillDelete } from 'react-icons/ai';
import { RiAdminFill } from 'react-icons/ri';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
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
import { useRouter } from 'next/router';
import Image from 'next/image';
import clsx from 'clsx';
import { FaComments } from 'react-icons/fa';
import Link from 'next/link';
import { cn } from '~/lib/utils';
import { checkAdminSession } from '~/server/helpers';
import { toast } from '~/components/ui/use-toast';

type UserWithComment = Prisma.UserGetPayload<{
  include: {
    comments: true;
  };
}>;

type UsersProps = {
  users: UserWithComment[];
};

export default function Users({ users }: UsersProps) {
  const router = useRouter();
  const { mutate: mutateDeleteUser } = api.user.delete.useMutation({
    onSuccess: () => {
      refreshData();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Something went wrong while deleting user. Please try again.',
      });
    },
  });
  const { mutate: mutateToggleAdmin } = api.user.toggleAdmin.useMutation({
    onSuccess: () => {
      refreshData();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error while trying to give admin to user',
      });
    },
  });

  const refreshData = () => {
    void router.replace(router.asPath);
  };

  function deleteUser(id: string) {
    mutateDeleteUser(id);
  }
  function toggleAdminUser(id: string) {
    mutateToggleAdmin(id);
  }

  return (
    <AdminLayout>
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <Table className="max-w-[95rem]">
          <TableCaption>A list of all users.</TableCaption>
          <TableHeader className="bold bg-gray-50 uppercase text-gray-700">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verified email</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Total comments</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="text-base">
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.emailVerified ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {user.image && (
                    <Image
                      src={user.image}
                      width={32}
                      height={32}
                      className="rounded-lg"
                      alt={`User avatar for ${user.name}`}
                    />
                  )}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.comments.length}</TableCell>
                <TableCell>
                  {format(user.createdAt, 'dd.MM.yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="hover:-slate-300">
                          <AiFillDelete className="h-8 w-8 transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this user and remove the data from the
                            server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button>
                          <RiAdminFill
                            className={cn(
                              'h-8 w-8 transition-colors duration-200 hover:scale-105 hover:text-zinc-600',
                              user.role === Role.ADMIN &&
                                'fill-gray-500 hover:fill-red-500'
                            )}
                          />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.role === Role.ADMIN
                              ? `Remove ${user.name} from being an admin?`
                              : `Give ${user.name} admin?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className={clsx(
                              user.role === Role.ADMIN
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-lime-500 hover:bg-lime-400'
                            )}
                            onClick={() => toggleAdminUser(user.id)}
                          >
                            {user.role === Role.ADMIN ? 'Remove' : 'Give'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Link href={`/admin/users/${user.id}`}>
                      <FaComments className="h-8 w-8 transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
                    </Link>
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
): Promise<GetServerSidePropsResult<UsersProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  const users = await db.user.findMany({
    orderBy: {
      role: 'desc',
    },
    include: {
      comments: true,
    },
  });

  return {
    props: {
      users,
    },
  };
}
