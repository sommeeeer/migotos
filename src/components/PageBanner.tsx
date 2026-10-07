import type { ReactNode } from 'react';
import { FaPaw } from 'react-icons/fa';

interface PageBannerProps {
  title: ReactNode;
  children?: ReactNode;
}

export default function PageBanner({ title, children }: PageBannerProps) {
  return (
    <header className="relative flex w-full flex-col items-center gap-3 overflow-hidden bg-[#faf6f0] px-6 py-12 text-center md:py-16">
      <FaPaw
        aria-hidden
        className="absolute -left-6 top-6 -rotate-12 text-[8rem] text-hoverbg/5"
      />
      <FaPaw
        aria-hidden
        className="absolute -bottom-8 -right-6 rotate-[30deg] text-[9rem] text-hoverbg/5"
      />
      <div className="flex items-center gap-3 text-hoverbg/40">
        <span className="h-px w-10 bg-current" />
        <FaPaw aria-hidden />
        <span className="h-px w-10 bg-current" />
      </div>
      <h1 className="relative max-w-3xl font-playfair text-3xl leading-tight text-stone-900 sm:text-4xl sm:leading-tight">
        {title}
      </h1>
      {children}
    </header>
  );
}
