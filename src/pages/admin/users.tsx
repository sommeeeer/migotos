import { Role, type User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Layout from "./Layout";
import type { GetServerSidePropsResult } from "next";
import { db } from "~/server/db";
import { format } from "date-fns";
import { AiFillDelete } from "react-icons/ai";
import { RiAdminFill } from "react-icons/ri";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
import { useRouter } from "next/router";
import Image from "next/image";
import clsx from "clsx";

type UsersProps = {
  users: User[];
};

export default function Users({ users }: UsersProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: mutateDeleteUser } = api.user.delete.useMutation({
    onSuccess: () => {
      refreshData();
    },
    onError: () => {
      console.log("Error while trying to delete comment");
    },
  });
  const { mutate: mutateToggleAdmin } = api.user.toggleAdmin.useMutation({
    onSuccess: () => {
      refreshData();
    },
    onError: () => {
      console.log("Error while trying to give admin to user");
    },
  });
  // Call this function whenever you want to
  // refresh props!
  const refreshData = () => {
    void router.replace(router.asPath);
  };

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }

  function deleteUser(id: string) {
    mutateDeleteUser(id);
  }
  function toggleAdminUser(id: string) {
    mutateToggleAdmin(id);
  }

  return (
    <Layout>
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
                <TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Image
                    src={user.image!}
                    width={32}
                    height={32}
                    className="rounded-lg"
                    alt={`User avatar for ${user.name}`}
                  />
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {format(user.createdAt, "dd/MM/yyyy HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
                        <button className="hover:-slate-300">
                          <RiAdminFill className="h-8 w-8 transition-colors duration-200 hover:text-zinc-600" />
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
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-lime-500 hover:bg-lime-400",
                            )}
                            onClick={() => toggleAdminUser(user.id)}
                          >
                            {user.role === Role.ADMIN ? "Remove" : "Give"}
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
  GetServerSidePropsResult<UsersProps>
> {
  const users = await db.user.findMany({
    orderBy: {
      role: "desc",
    },
  });

  return {
    props: {
      users,
    },
  };
}
