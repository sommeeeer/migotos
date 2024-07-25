import { useRouter } from "next/router";
import { Edit } from "lucide-react";

import { cn } from "~/lib/utils";

interface Props {
  link: string;
  className?: string;
}

export default function EditIconButton({ link, className }: Props) {
  const router = useRouter();
  return (
    <button
      title="Edit"
      onClick={() => {
        void router.push(`/admin/${link}`);
      }}
      className={
        "flex items-center gap-0.5 rounded-full p-1 text-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
      }
    >
      <Edit className={cn("size-6", className)} />
    </button>
  );
}
