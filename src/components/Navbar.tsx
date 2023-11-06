import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import LoadingSpinner from "./ui/LoadingSpinner";
import { Role } from "@prisma/client";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { AiOutlineCloseCircle } from "react-icons/ai";

interface NavbarProps {
  isOpen: boolean;
  closeMobileMenu: () => void;
}

function Navbar({ isOpen, closeMobileMenu }: NavbarProps) {
  const router = useRouter();
  const links = ["About", "Cats", "Kittens", "News", "Contact", "Instagram"];

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="navbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.9)] text-zinc-100"
        >
          <nav className="flex flex-col gap-6 text-center">
            {links.map((link, index) => (
              <NavItem
                href={`/${link.toLowerCase()}`}
                text={link}
                router={router}
                key={index}
                closeMobileMenu={closeMobileMenu}
              />
            ))}
            <LoginNavButton closeMobileMenu={closeMobileMenu} />
          </nav>
        </motion.div>
      ) : (
        <nav className="mx-auto hidden max-w-sm items-center justify-center px-4 md:flex">
          {links.map((link, index) => (
            <NavItem
              href={`/${link.toLowerCase()}`}
              text={link}
              router={router}
              key={index}
              closeMobileMenu={closeMobileMenu}
            />
          ))}
          <LoginNavButton closeMobileMenu={closeMobileMenu} />
        </nav>
      )}
    </AnimatePresence>
  );
}

function NavItem({
  href,
  text,
  router,
  closeMobileMenu,
}: {
  href: string;
  text: string;
  router: NextRouter;
  closeMobileMenu: () => void;
}) {
  const isActive = router.pathname === (href === "/home" ? "/" : href);
  const isInstagram = text === "Instagram";

  return (
    <Link
      href={isInstagram ? "https://www.instagram.com/migotos/" : href}
      rel={isInstagram ? "noopener noreferrer" : ""}
      target={isInstagram ? "_blank" : ""}
      onClick={closeMobileMenu}
      className={clsx(
        "mr-4 text-3xl font-medium md:text-lg",
        isActive
          ? "pointer-events-none text-zinc-500 md:text-hoverbg"
          : "transition-colors duration-300 hover:text-zinc-400 md:hover:text-hoverbg",
      )}
    >
      {text}
    </Link>
  );
}

function LoginNavButton({ closeMobileMenu }: { closeMobileMenu: () => void }) {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";

  function Login(setShowLoginPanel: Dispatch<SetStateAction<boolean>>) {
    setShowLoginPanel((prevState) => !prevState);
  }

  function Logout() {
    void signOut();
  }

  function LoginLogoutButton() {
    const [showLoginPanel, setShowLoginPanel] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={session ? Logout : () => Login(setShowLoginPanel)}
          disabled={isLoading}
          className="mr-4 text-3xl font-medium transition-colors duration-300 hover:text-zinc-400 md:text-lg md:hover:text-hoverbg"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-3" />
            </>
          ) : session ? (
            "Logout"
          ) : (
            "Login"
          )}
        </button>
        {showLoginPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            className="absolute -left-1/2 flex flex-col items-start rounded-xl bg-gray-200 p-4 transition-all duration-300 ease-out"
          >
            <button
              onClick={() => setShowLoginPanel(false)}
              className="absolute right-0 top-0 p-1 hover:scale-110"
            >
              <AiOutlineCloseCircle />
            </button>
            <span className="block">Login via</span>
            <button className="group" onClick={() => signIn("google")}>
              <FcGoogle className="h-16 w-16 self-center group-hover:scale-105" />
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  if (session?.user.role === Role.ADMIN) {
    return (
      <>
        <LoginLogoutButton />
        <Link
          href="/admin"
          onClick={closeMobileMenu}
          className={clsx("mr-4 text-3xl font-medium md:text-lg")}
        >
          Admin
        </Link>
      </>
    );
  }

  return <LoginLogoutButton />;
}

export default Navbar;
