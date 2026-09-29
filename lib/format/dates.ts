const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
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

export interface DateRangeValue {
  start: string;
  end: string;
  current: boolean;
}

/** "2022-03" → "Mar 2022", "2022" → "2022", anything unparseable is returned trimmed. */
export function formatPartialDate(value: string): string {
  const v = value.trim();
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(v);
  if (!m) return v;
  const [, year, month] = m;
  if (!month) return year;
  const idx = Number(month) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${year}` : year;
}

/** Europass style: "2022-03" → "03/2022", "2022" → "2022", anything unparseable is returned trimmed. */
export function formatNumericPartialDate(value: string): string {
  const v = value.trim();
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(v);
  if (!m) return v;
  const [, year, month] = m;
  if (!month) return year;
  const idx = Number(month) - 1;
  return idx >= 0 && idx < 12 ? `${month}/${year}` : year;
}

/**
 * "Jan 2022 – Present", "2018 – 2022", "Mar 2020", or "" when nothing is set.
 * `format` renders each end, e.g. formatNumericPartialDate for "01/2022 – Current".
 */
export function formatDateRange(range: DateRangeValue, presentLabel = "Present", format = formatPartialDate): string {
  const start = format(range.start);
  const end = range.current ? presentLabel : format(range.end);
  if (start && end) return start === end ? start : `${start} – ${end}`;
  return start || end;
}

/** The year only, e.g. a biodata "Passing year" column. */
export function rangeEndYear(range: DateRangeValue, presentLabel = "Running"): string {
  if (range.current) return presentLabel;
  return (range.end || range.start).slice(0, 4);
}

function parseIsoDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "1996-03-15" → "15 March 1996". */
export function formatIsoDate(value: string): string {
  const d = parseIsoDate(value);
  if (!d) return value.trim();
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** "1996-03-15" → "15/03/1996" (day first, as on a Europass CV). */
export function formatNumericIsoDate(value: string): string {
  const d = parseIsoDate(value);
  if (!d) return value.trim();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Whole years between the date of birth and `today`; null when the date is missing or in the future. */
export function ageInYears(dateOfBirth: string, today: Date = new Date()): number | null {
  const dob = parseIsoDate(dateOfBirth);
  if (!dob || dob > today) return null;
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** Local date as YYYY-MM-DD (used for file names and default declaration dates). */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
