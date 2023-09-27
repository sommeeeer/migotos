import YearButton from "./ui/YearButton";

interface FilterLittersProps {
  years: number[];
  filterByYear: (year: number | string) => void;
}

export default function FilterLitters({
  years,
  filterByYear,
}: FilterLittersProps) {
  return (
    <div className="mt-4 mb-6 flex flex-wrap gap-x-5 gap-y-3 px-6 font-medium">
      {["All", ...years].map((year) => (
        <YearButton key={year} year={year} filterByYear={filterByYear} />
      ))}
    </div>
  );
}
