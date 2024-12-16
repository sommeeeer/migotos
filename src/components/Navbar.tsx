import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { type NextRouter, useRouter } from 'next/router';
import LoginModal from './LoginModal';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { Search } from 'lucide-react';
import { cn } from '~/lib/utils';

interface NavbarProps {
  isOpen: boolean;
  closeMobileMenu: () => void;
}

function Navbar({ isOpen, closeMobileMenu }: NavbarProps) {
  const router = useRouter();
  const links = ['About', 'Cats', 'Kittens', 'News', 'Contact', 'Instagram'];
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
            <SearchBarMobile className="relative -top-8" />
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
        <nav className="hidden items-center justify-center px-4 md:flex">
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
          <SearchBarDesktop />
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
  const isActive = router.pathname === (href === '/home' ? '/' : href);
  const isInstagram = text === 'Instagram';

  return (
    <Link
      href={isInstagram ? 'https://www.instagram.com/migotos/' : href}
      rel={isInstagram ? 'noopener noreferrer' : ''}
      target={isInstagram ? '_blank' : ''}
      onClick={closeMobileMenu}
      className={clsx(
        'mr-4 text-3xl font-medium md:text-lg',
        isActive
          ? 'pointer-events-none text-zinc-500 md:text-hoverbg'
          : 'transition-colors duration-300 hover:text-zinc-400 md:hover:text-hoverbg'
      )}
    >
      {text}
    </Link>
  );
}

function SearchBarMobile({ className }: { className?: string }) {
  return (
    <form
      action="/search"
      className={cn(
        'md relative mx-auto flex w-2/3 max-w-xl items-center justify-center space-x-2 rounded-full bg-white px-4 py-2 shadow-md',
        className
      )}
    >
      <Search className="h-5 w-5 stroke-gray-700" />
      <input
        type="search"
        aria-label="Search"
        pattern=".{1,}"
        required
        title="1 characters minimum"
        autoComplete="off"
        name="q"
        placeholder="Search..."
        className="w-full bg-transparent px-2 py-1 text-sm text-gray-700 outline-none"
      />
    </form>
  );
}

function SearchBarDesktop({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <form
      action="/search"
      className={cn(
        'relative',
        className,
        router.pathname === '/search' && 'hidden'
      )}
    >
      <Search className="absolute left-0 ml-2 mt-2 h-5 w-5" />
      <input
        pattern=".{1,}"
        required
        title="1 characters minimum"
        type="search"
        aria-label="Search"
        autoComplete="off"
        name="q"
        className="w-[120px] rounded-full bg-gray-100/60 py-2 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:w-[170px] focus:bg-gray-100 focus:shadow-xl"
        placeholder="Search..."
      />
    </form>
  );
}

export default Navbar;
