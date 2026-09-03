export const iso = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// Returns [from, to] as YYYY-MM-DD, or null for "custom".
export function presetRange(preset, now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case "this-month":
      return [iso(new Date(y, m, 1)), iso(now)];
    case "last-month":
      return [iso(new Date(y, m - 1, 1)), iso(new Date(y, m, 0))];
    case "this-quarter": {
      const q = Math.floor(m / 3) * 3;
      return [iso(new Date(y, q, 1)), iso(now)];
    }
    case "this-year":
      return [iso(new Date(y, 0, 1)), iso(now)];
    default:
      return null;
  }
}

export const RANGE_PRESETS = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "this-year", label: "This year" },
  { value: "custom", label: "Custom range" },
];
