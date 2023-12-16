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
import { AiFillFacebook, AiOutlineMail } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";

interface LoginModalProps {
  variant: "comment" | "navbar";
}

export default function LoginModal({ variant }: LoginModalProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [isLoadingGoogle, setisLoadingGoogle] = useState(false);
  const [isLoadingFacebook, setisLoadingFacebook] = useState(false);
  const [isLoadingEmail, setisLoadingEmail] = useState(false);

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
  function handleEmailSignIn() {
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
      setisLoadingEmail(true);
      void signIn("email", { email: email });
    } catch (error) {
      setError("Please enter a valid email address");
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  return (
    <Dialog
      onOpenChange={() => {
        setError(null);
        setEmail("");
      }}
    >
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
          <DialogDescription className="text-base">
            Login via one of our providers
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col items-center gap-4">
          <FaCat className="text-6xl" />
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setisLoadingGoogle(true);
                void signIn("google");
              }}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-14 py-2 font-normal text-[#3B4045] hover:bg-[#F9FAFA] hover:text-[#3b4045]"
            >
              {isLoadingGoogle ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FcGoogle size={20} />
              )}
              Log in with Google
            </button>
            <button
              onClick={() => {
                setisLoadingFacebook(true);
                void signIn("facebook");
              }}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-[#385499] px-14 py-2 font-normal text-gray-100 hover:bg-[#2a4894] hover:text-gray-200"
            >
              {isLoadingFacebook ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <AiFillFacebook size={20} color={"white"} />
              )}
              Log in with Facebook
            </button>
            <div className="flex flex-col gap-2">
              <div className="my-4 w-full border"></div>
              {error && <p className="text-red-500">{error}</p>}
              <Input
                type="email"
                onChange={handleEmailChange}
                value={email}
                placeholder="email@example.com"
              ></Input>
              <button
                onClick={handleEmailSignIn}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-14 py-2 font-normal text-[#3B4045] hover:bg-[#F9FAFA] hover:text-[#3b4045]"
              >
                {isLoadingEmail ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <AiOutlineMail size={20} fill="blue" />
                )}
                Sign in with Email
              </button>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
