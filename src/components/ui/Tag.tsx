import type { ComponentProps } from "react";

export default function Tag({
  value,
  ...rest
}: { value: string } & ComponentProps<"span">) {
  return (
    <span
      {...rest}
      className="mb-2 mr-2 inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-gray-700  outline outline-1 transition-colors duration-200 hover:bg-zinc-200 hover:outline-2"
    >
      {value}
    </span>
  );
}
