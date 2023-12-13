import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { FaCat } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { AiFillFacebook } from "react-icons/ai";

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
            <LoginModal />
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
          <LoginModal />
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
  let hrefFormatted = "";
  if (text === "Sign in") {
    hrefFormatted = "/auth/signin";
  } else {
    hrefFormatted = `/${text.toLowerCase()}`;
  }

  return (
    <Link
      href={isInstagram ? "https://www.instagram.com/migotos/" : hrefFormatted}
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

function LoginModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="mr-4 text-3xl font-medium transition-colors duration-300 hover:text-zinc-400 md:text-lg md:hover:text-hoverbg">
          Sign in
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center gap-8 bg-[#F1F2F3] max-w-[375px] rounded-md">
        <DialogHeader>
          <DialogTitle className="mx-auto">Sign in</DialogTitle>
          <DialogDescription>Sign in to one of our providers</DialogDescription>
        </DialogHeader>
        <section className="flex flex-col items-center gap-4">
          <FaCat className="text-6xl" />
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => void signIn("google")}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-14 py-2 font-normal text-[#3B4045] hover:bg-[#F9FAFA] hover:text-[#3b4045]"
            >
              <FcGoogle size={20} />
              Log in with Google
            </button>
            <button
              onClick={() => void signIn("facebook")}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-[#385499] px-14 py-2 font-normal text-gray-100 hover:bg-[#2a4894] hover:text-gray-200"
            >
              <AiFillFacebook size={20} color={"white"} />
              Log in with Facebook
            </button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

export default Navbar;
