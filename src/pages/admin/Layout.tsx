import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import { BiNews, BiSolidCat } from "react-icons/bi";
import { FaCat } from "react-icons/fa";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <div className="flex h-screen self-stretch">
      {/* Left-side menu */}
      <div className="w-1/5 rounded-sm bg-zinc-800 p-4 text-white">
        <h1 className="text-2xl font-bold">Admin</h1>
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
                  router.pathname === "/admin/users" &&
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
                  router.pathname === "/admin/messages" &&
                    "bg-blue-800 text-white",
                ),
              )}
            >
              <HiUsers className="mr-2 h-6 w-6" />
              Messages
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/admin/news"
              className={twMerge(
                clsx(
                  "flex items-center rounded-lg p-2 text-base font-normal text-gray-300 hover:bg-blue-800 hover:text-white",
                  router.pathname === "/admin/news" && "bg-blue-800 text-white",
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
                  router.pathname === "/admin/cats" && "bg-blue-800 text-white",
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
                  router.pathname === "/admin/litters" &&
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

      <div className="w-4/5 rounded bg-gray-100 p-4">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
