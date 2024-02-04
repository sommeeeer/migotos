import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import { BiMessageSquareDetail, BiNews, BiSolidCat } from "react-icons/bi";
import { FaCat } from "react-icons/fa";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { Toaster } from "~/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const splittedPath = router.pathname.split("/");
  let heading = "Dashboard";
  if (splittedPath.length <= 3) {
    heading =
      splittedPath.at(-1)![0]?.toUpperCase() + splittedPath.at(-1)!.slice(1);
  } else {
    heading =
      splittedPath.at(2)![0]?.toUpperCase() + splittedPath.at(2)!.slice(1);
  }

  return (
    <div className="flex h-screen self-stretch">
      <Toaster />

      <div className="w-64 rounded-sm bg-zinc-800 p-4 text-white">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <ul className="mt-4">
          <li className="mb-2">
            <Link
              href="/admin"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname === "/admin" && "bg-blue-800 text-white",
                ),
              )}
            >
              <MdDashboard className="mr-2 h-6 w-6" />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/admin/users"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname.startsWith("/admin/users") &&
                    "bg-blue-800 text-white",
                ),
              )}
            >
              <HiUsers className="mr-2 h-6 w-6" />
              Users
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/admin/messages"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname.startsWith("/admin/messages") &&
                    "bg-blue-800 text-white",
                ),
              )}
            >
              <BiMessageSquareDetail className="mr-2 h-6 w-6" />
              Messages
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/admin/news"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname.startsWith("/admin/news") &&
                    "bg-blue-800 text-white",
                ),
              )}
            >
              <BiNews className="mr-2 h-6 w-6" />
              News
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/admin/cats"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname.startsWith("/admin/cats") &&
                    "bg-blue-800 text-white",
                ),
              )}
            >
              <FaCat className="mr-2 h-6 w-6" />
              Cats
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/admin/litters"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname.startsWith("/admin/litters") &&
                    "bg-blue-800 text-white",
                ),
              )}
            >
              <BiSolidCat className="mr-2 h-6 w-6" />
              Litters
            </Link>
          </li>
        </ul>
      </div>

      <div className="w-full rounded bg-gray-50 p-4">
        <div className="bg-gray-100">{children}</div>
      </div>
    </div>
  );
}
