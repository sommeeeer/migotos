interface YearButtonProps {
  year: number | string;
  filterByYear: (year: number | string) => void;
}

export default function YearButton({ year, filterByYear }: YearButtonProps) {
  return (
    <button
      type="button"
      className="rounded bg-transparent text-gray-700 hover:bg-gray-100 focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200"
      onClick={() => filterByYear(year)}
    >
      {year}
    </button>
  );
}
