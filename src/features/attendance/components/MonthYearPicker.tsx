const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = [2024, 2025, 2026, 2027];

export function MonthYearPicker({
  month,
  year,
  onMonth,
  onYear,
}: {
  month: number;
  year: number;
  onMonth: (m: number) => void;
  onYear: (y: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => onMonth(Number(e.target.value))}
        aria-label="Select month" // Added accessible name
        className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none"
      >
        {MONTHS.map((name, i) => (
          <option key={i + 1} value={i + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onYear(Number(e.target.value))}
        aria-label="Select year" // Added accessible name
        className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
