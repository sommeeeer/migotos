import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import LoginModal from "./LoginModal";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface NavbarProps {
  isOpen: boolean;
  closeMobileMenu: () => void;
}

function Navbar({ isOpen, closeMobileMenu }: NavbarProps) {
  const router = useRouter();
  const links = ["About", "Cats", "Kittens", "News", "Contact", "Instagram"];
  const session = useSession();

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
            <LoginModal variant="navbar" />
            {session.data?.user.role === Role.ADMIN && (
              <NavItem
                href="/admin"
                text="Admin"
                router={router}
                key="admin"
                closeMobileMenu={closeMobileMenu}
              />
            )}
          </nav>
        </motion.div>
      ) : (
        <nav className="mx-auto hidden max-w-2xl items-center justify-center px-4 md:flex">
          {links.map((link, index) => (
            <NavItem
              href={`/${link.toLowerCase()}`}
              text={link}
              router={router}
              key={index}
              closeMobileMenu={closeMobileMenu}
            />
          ))}
          <LoginModal variant="navbar" />
          {session.data?.user.role === Role.ADMIN && (
            <NavItem
              href="/admin"
              text="Admin"
              router={router}
              key="admin"
              closeMobileMenu={closeMobileMenu}
            />
          )}
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

export default Navbar;
