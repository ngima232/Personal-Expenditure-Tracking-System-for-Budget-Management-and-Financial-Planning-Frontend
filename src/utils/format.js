function getCurrency() {
  try {
    const user = JSON.parse(localStorage.getItem("ledger_user"));

    return user?.currency || "GBP";
  } catch {
    return "GBP";
  }
}

export function formatCurrency(amount) {
  const value = Number(amount) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: getCurrency(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateInput(date) {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 10);
}

export function titleCase(str = "") {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}