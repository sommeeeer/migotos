import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { FaCat } from "react-icons/fa";
import { signIn, signOut } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { AiFillFacebook } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { cn } from "~/lib/utils";

interface LoginModalProps {
  variant: "comment" | "navbar";
}

export default function LoginModal({ variant }: LoginModalProps) {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => void signOut()}
        className="mr-4 text-3xl font-medium transition-colors duration-300 hover:text-zinc-400 md:text-lg md:hover:text-hoverbg"
      >
        Sign out
      </button>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn({
            "mr-4 text-3xl font-medium transition-colors duration-300 hover:text-zinc-400 md:text-lg md:hover:text-hoverbg":
              variant === "navbar",
            "h-14 w-4/6 cursor-pointer rounded-md border-2 border-solid border-gray-200 p-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600":
              variant === "comment",
          })}
        >
          Sign in
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-w-[375px] flex-col items-center gap-8 rounded-md bg-[#F1F2F3]">
        <DialogHeader>
          <DialogTitle className="mx-auto text-xl">Sign in</DialogTitle>
          <DialogDescription className="text-base">Login via one of our providers</DialogDescription>
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
