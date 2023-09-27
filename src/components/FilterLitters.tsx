import YearButton from "./ui/YearButton";

interface FilterLittersProps {
  years: number[];
  filterByYear: (year: number | string) => void;
  currentYear: number | string | null;
}

export default function FilterLitters({
  years,
  filterByYear,
  currentYear,
}: FilterLittersProps) {
  return (
    <div className="mb-6 mt-4 flex flex-wrap gap-x-5 gap-y-3 px-6 font-normal">
      {["All", ...years].map((year) => (
        <YearButton
          className={currentYear === year ? "text-hoverbg font-semibold" : ""}
          key={year}
          year={year}
          filterByYear={filterByYear}
          currentYear={currentYear}
        />
      ))}
    </div>
  );
}
