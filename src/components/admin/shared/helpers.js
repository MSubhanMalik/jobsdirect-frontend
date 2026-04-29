export function humanize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatSalary(job) {
  const min = Number(job?.salary_min);
  const max = Number(job?.salary_max);
  if (!Number.isFinite(min) && !Number.isFinite(max)) return "Not listed";
  const currency = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  if (Number.isFinite(min) && Number.isFinite(max) && min !== max) {
    return `${currency.format(min)} - ${currency.format(max)}`;
  }
  return currency.format(Number.isFinite(min) ? min : max);
}

export function formatMoneyFromCents(amount, currency = "eur") {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: String(currency || "eur").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(Number(amount || 0) / 100);
}

export function toNumber(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function splitList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function searchRecords(items, search, fields) {
  const term = search.trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) =>
    fields.some((field) => String(item?.[field] || "").toLowerCase().includes(term)),
  );
}
