import { type ContactMessage } from '../../../../prisma/generated/browser';
import AdminLayout from '../AdminLayout';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { db } from '~/server/db';
import { format } from 'date-fns';
import { BiMessageAltDetail } from 'react-icons/bi';
import { AiFillDelete, AiOutlineMail } from 'react-icons/ai';
import { BiTime } from 'react-icons/bi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
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
import { checkAdminSession } from '~/server/helpers';
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/use-toast';
import { useState } from 'react';
import { cn } from '~/lib/utils';
import { Inbox, MailCheck, MailOpen, RotateCcw, Trash2 } from 'lucide-react';

type MessagesProps = {
  initialMessages: ContactMessage[];
};

export default function Messages({ initialMessages }: MessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);

  const { refetch, isFetching } = api.contact.getAll.useQuery(undefined, {
    initialData: messages,
    refetchOnMount: false,
    onSuccess: (data) => {
      setMessages(data);
    },
  });
  const { mutate: mutateDeleteOne } = api.contact.delete.useMutation({
    onSuccess: () => {
      toast({
        variant: 'default',
        title: 'Success',
        color: 'green',
        description: 'Message deleted successfully.',
      });
      void refetch();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error while trying to delete message.',
      });
    },
  });
  const { mutate: mutateDeleteAll } = api.contact.deleteAll.useMutation({
    onSuccess: () => {
      toast({
        variant: 'default',
        title: 'Success',
        color: 'green',
        description: 'Messages deleted successfully.',
      });
      void refetch();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while deleting all messages.',
      });
    },
  });
  const { mutate: mutateSetOpened } = api.contact.setOpened.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  function handleOpenMessage(id: number) {
    mutateSetOpened(id);
  }

  function deleteMessage(id: number) {
    mutateDeleteOne(id);
  }

  function deleteAll() {
    mutateDeleteAll();
  }

  return (
    <AdminLayout>
      <div className="flex flex-col items-center gap-4 rounded-xl border-2 p-4 text-center">
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="flex items-center gap-1"
                variant="destructive"
                disabled={messages.length === 0}
              >
                <Trash2 className="h-5 w-5" />
                Delete all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  the messages and remove the data from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={deleteAll}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            className={cn(isFetching && 'bg-gray-700')}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RotateCcw
              className={cn('h-5 w-5', isFetching && 'animate-spin')}
            />
          </Button>
        </div>
      </div>
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <Table className="max-w-7xl">
          <TableCaption>A list of all messages.</TableCaption>
          <TableHeader className="bold bg-gray-50 uppercase text-gray-700">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <Inbox />
              </TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow
                key={message.id}
                className={cn('text-base', !message.seen && 'font-semibold')}
              >
                <TableCell>{message.id}</TableCell>
                <TableCell>{message.name}</TableCell>
                <TableCell className="max-w-xs overflow-hidden text-ellipsis px-3 py-4">
                  {message.subject}
                </TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>
                  {message.seen ? <MailCheck /> : <MailOpen />}
                </TableCell>
                <TableCell>
                  {format(message.createdAt, 'dd.MM.yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger
                        onClick={() => handleOpenMessage(message.id)}
                      >
                        <BiMessageAltDetail className="h-8 w-8 transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
                      </DialogTrigger>
                      <DialogContent className="p-8">
                        <DialogHeader>
                          <DialogTitle className="max-w-xs overflow-hidden text-ellipsis text-lg">
                            {message.subject}
                          </DialogTitle>
                          <div className="mb-10 flex justify-between text-gray-600">
                            <span className="flex items-center gap-1">
                              <BiTime />
                              {format(message.createdAt, 'dd.MM.yyyy HH:mm:ss')}
                            </span>
                            <a href={`mailto:${message.email}`}>
                              <span className="flex items-center gap-1">
                                <AiOutlineMail />
                                {message.email}
                              </span>
                            </a>
                          </div>
                          <DialogDescription className="whitespace-break-spaces pt-4  text-lg text-gray-800">
                            {message.message}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button>
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
    </AdminLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<MessagesProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  const initialMessages = await db.contactMessage.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    props: {
      initialMessages,
    },
  };
}
