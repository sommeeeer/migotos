import { useEffect, useState } from "react";
import { TfiAngleDoubleUp } from "react-icons/tfi";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { BsFacebook, BsInstagram } from "react-icons/bs";

export default function Footer() {
  const [showButton, setShowButton] = useState(false);
  useEffect(() => {
    function handleScrollButtonVisibility() {
      window.scrollY > 300 ? setShowButton(true) : setShowButton(false);
    }
    window.addEventListener("scroll", handleScrollButtonVisibility);

    return () => {
      window.removeEventListener("scroll", handleScrollButtonVisibility);
    };
  }, []);
  return (
    <footer
      className={cn(
        "flex w-full max-w-3xl flex-col justify-center border-t-2 border-t-zinc-100 px-4",
        !showButton && "mb-6",
      )}
    >
      <div className="mt-8 flex flex-col items-center justify-between gap-6 text-center">
        <div>
          <Button
            variant="link"
            className="text-gray-600 hover:text-gray-800"
            asChild
          >
            <Link href="/terms">Terms of Service</Link>
          </Button>
          <Button
            variant="link"
            className="text-gray-600 hover:text-gray-800"
            asChild
          >
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
        </div>
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/eva.d.eide"
            rel="noopener noreferrer"
            target="_blank"
          >
            <BsFacebook className="h-10 w-10 text-zinc-700 hover:relative hover:bottom-[2px] hover:text-zinc-400" />
          </a>
          <a
            href="https://www.instagram.com/migotos/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <BsInstagram className="h-10 w-10 text-zinc-700 hover:relative hover:bottom-[2px] hover:text-zinc-400" />
          </a>
        </div>
        <p className="font-poppins text-sm text-gray-700">
          Copyright © Migotos {new Date().getFullYear()}
        </p>
        {showButton && (
          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <div className="mb-6 flex items-center gap-2 text-hoverbg hover:text-zinc-400">
              <p className="text-base">Go to top</p>
              <TfiAngleDoubleUp size={"2rem"} className="" />
            </div>
          </button>
        )}
      </div>
    </footer>
  );
}
