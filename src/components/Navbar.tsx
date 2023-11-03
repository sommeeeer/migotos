import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import { popupCenter } from "~/utils/helpers";
import LoadingSpinner from "./ui/LoadingSpinner";

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

  function Login() {
    popupCenter("/google-signin", "Google Sign In"), closeMobileMenu();
  }

  function Logout() {
    void signOut();
  }

  return (
    <button
      onClick={session ? Logout : Login}
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
  );
}

export default Navbar;
