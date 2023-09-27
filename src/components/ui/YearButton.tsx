import clsx from "clsx";

interface YearButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  year: number | string;
  filterByYear: (year: number | string) => void;
  className: string;
}

export default function YearButton({
  year,
  filterByYear,
  className,
}: YearButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "rounded bg-transparent text-gray-700 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200",
        className,
      )}
      onClick={() => filterByYear(year)}
    >
      {year}
    </button>
  );
}
