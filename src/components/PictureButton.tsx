import Link from 'next/link';

interface PictureButtonProps {
  label: string;
  url: string;
}

export default function PictureButton({ label, url }: PictureButtonProps) {
  return (
    <Link
      href={url}
      className="rounded border border-zinc-500 bg-transparent px-16 py-3 transition-all duration-300 ease-in-out hover:border-transparent hover:bg-black hover:text-white"
    >
      {label}
    </Link>
  );
}
