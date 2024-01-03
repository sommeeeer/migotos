import { useEffect, useState } from "react";
import { TfiAngleDoubleUp } from "react-icons/tfi";
import { Button } from "./ui/button";
import Link from "next/link";

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
    <footer className="flex h-32 w-full max-w-3xl flex-col justify-center border-t-2 border-t-zinc-100 px-4">
      <div className="mt-12 flex flex-col items-center justify-between gap-4 text-center">
        <div>
          <Button variant="link" asChild>
            <Link href="/terms">Terms of Service</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
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
