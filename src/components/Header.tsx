import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import migotosLogo from "../../public/static/migotos_logo.png";
import Navbar from "~/components/Navbar";
import Hamburger from "hamburger-react";
import { useState } from "react";
import type { ReactNode } from "react";
import noScroll from "no-scroll";

interface LayoutProps {
  children: ReactNode; // ReactNode allows rendering any type of React component or JSX
}

export default function Header({ children }: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  function closeMobileMenu() {
    noScroll.off();
    setIsMobileOpen(false);
  }

  return (
    <>
      <Head>
        <meta name="description" content="Migotos Norwegian Forest Cattery" />
      </Head>
      <header
        className={`z-50 flex items-center justify-between p-6 md:mt-6 md:flex-col md:gap-12`}
      >
        <Link href="/">
          <Image
            src={migotosLogo}
            alt="Migotos logo"
            width={130}
            quality={100}
          />
        </Link>
        <div
          className={`z-50 md:hidden ${
            isMobileOpen ? "text-zinc-300" : "text-zinc-700"
          }`}
        >
          <Hamburger
            toggled={isMobileOpen}
            toggle={() => {
              setIsMobileOpen(!isMobileOpen);
              noScroll.toggle();
            }}
            label="Show menu"
          />
        </div>
        <Navbar isOpen={isMobileOpen} closeMobileMenu={closeMobileMenu} />
      </header>
      <main className={`flex w-full flex-col items-center pt-4`}>
        {children}
      </main>
    </>
  );
}
