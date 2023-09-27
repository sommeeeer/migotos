import clsx from "clsx";

interface YearButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  year: number | string;
  filterByYear: (year: number | string) => void;
  className: string;
  currentYear: number | string | null;
}

export default function YearButton({
  year,
  filterByYear,
  className,
  currentYear
}: YearButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "rounded bg-transparent text-gray-700 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200",
        className,
      )}
      disabled={currentYear === year}
      onClick={() => filterByYear(year)}
    >
      {year}
    </button>
  );
}
