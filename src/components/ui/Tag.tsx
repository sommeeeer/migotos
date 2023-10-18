import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export default function Tag({
  value,
  className,
  ...rest
}: {
  value: string;
  className?: string;
} & ComponentProps<"span">) {
  return (
    <span
      {...rest}
      className={twMerge(
        "tracking-wid mb-2 mr-2 inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-gray-700 transition-colors duration-200 hover:bg-zinc-200 hover:outline-2",
        className,
      )}
    >
      {value}
    </span>
  );
}
