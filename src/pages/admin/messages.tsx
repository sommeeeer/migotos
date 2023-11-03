import { type ContactMessage, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import Layout from "./Layout";
import type { GetServerSidePropsResult } from "next";
import { db } from "~/server/db";
import { format } from "date-fns";
import { BiMessageAltDetail } from "react-icons/bi";

type MessagesProps = {
  messages: ContactMessage[];
};

export default function Messages({ messages }: MessagesProps) {
  const { data: session, status } = useSession();

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }
  console.log(messages);
  return (
    <Layout>
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <table className="table-auto">
          <thead className="bg-gray-50 uppercase text-gray-700 ">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Created at</th>
              <th className="px-6 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="border-b border-slate-200">
                <td className="px-3 py-4">{message.name}</td>
                <td className="max-w-xs overflow-hidden text-ellipsis px-3 py-4">
                  {message.subject}
                </td>
                <td className="px-3 py-4">{message.email}</td>
                <td className="px-3 py-4">
                  {format(message.createdAt, "dd/MM/yyyy HH:mm:ss")}
                </td>
                <td className="cursor-pointer px-3 py-4 hover:bg-slate-200">
                  <BiMessageAltDetail className="mx-auto h-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<MessagesProps>
> {
  const messages = await db.contactMessage.findMany({});

  return {
    props: {
      messages,
    },
  };
}
