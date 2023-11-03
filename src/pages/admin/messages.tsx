import { type ContactMessage, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import Layout from "./Layout";
import type { GetServerSidePropsResult } from "next";
import { db } from "~/server/db";
import { format } from "date-fns";
import { BiMessageAltDetail } from "react-icons/bi";
import { AiFillDelete, AiOutlineMail } from "react-icons/ai";
import { BiTime } from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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

type MessagesProps = {
  messages: ContactMessage[];
};

export default function Messages({ messages }: MessagesProps) {
  const { data: session, status } = useSession();

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }

  function deleteMessage(id: number) {
    console.log(id);
  }

  return (
    <Layout>
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <Table className="max-w-7xl">
          <TableCaption>A list of all messages.</TableCaption>
          <TableHeader className="bold bg-gray-50 uppercase text-gray-700">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} className="text-base">
                <TableCell>{message.name}</TableCell>
                <TableCell className="max-w-xs overflow-hidden text-ellipsis px-3 py-4">
                  {message.subject}
                </TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>
                  {format(message.createdAt, "dd/MM/yyyy HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger>
                        <BiMessageAltDetail className="h-8 w-8 transition-colors duration-200 hover:text-zinc-600" />
                      </DialogTrigger>
                      <DialogContent className="p-8">
                        <DialogHeader>
                          <DialogTitle className="max-w-xs overflow-hidden text-ellipsis text-lg">
                            {message.subject}
                          </DialogTitle>
                          <div className="mb-10 flex justify-between text-gray-600">
                            <span className="flex items-center gap-1">
                              <BiTime />
                              {format(message.createdAt, "dd/MM/yyyy HH:mm:ss")}
                            </span>
                            <a href={"mailto:eva@migotos.com"}>
                              <span className="flex items-center gap-1">
                                <AiOutlineMail />
                                {message.email}
                              </span>
                            </a>
                          </div>
                          <DialogDescription className="pt-4 text-lg  text-gray-800 ">
                            {message.message}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
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
                            delete this message and remove the data from the
                            server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteMessage(message.id)}
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
  GetServerSidePropsResult<MessagesProps>
> {
  const messages = await db.contactMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: {
      messages,
    },
  };
}
