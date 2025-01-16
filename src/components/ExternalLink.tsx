import { ExternalLinkIcon } from 'lucide-react';

export default function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      rel="noopener noreferrer"
      target="_blank"
      className="font-semibold underline inline-flex items-center gap-1"
      href={href}
    >
      {children}
      <ExternalLinkIcon className="size-4" />
    </a>
  );
}
