// Lightweight client-side RFM-style tag for a row from /reports/customers.
// Not persisted anywhere — just a read of fields the dashboard already returns.
export const SEGMENT_LABEL = {
  vip: "VIP",
  steady: "Steady",
  at_risk: "At risk",
  new: "New",
};

export function segmentFor(row, { to, rankIndex }) {
  if (row.is_new) return "new";

  const last = row.last_order_date ? new Date(`${row.last_order_date}T00:00:00`) : null;
  const ref = new Date(`${to}T00:00:00`);
  const daysSince = last ? Math.round((ref - last) / 86400000) : Infinity;
  if (daysSince > 45) return "at_risk";

  return rankIndex < 3 ? "vip" : "steady";
}
