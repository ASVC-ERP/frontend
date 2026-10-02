import { TbAlertTriangle } from "react-icons/tb";

// items: [{ product_id, description, days_ago, status }] -- in-stock
// products with no sale or purchase in 90 days (see DormantProductsPage).
export default function NoRecentActivityCards({ items, limit = 5 }) {
  if (!items.length) {
    return <div className="report-panel-empty">Nothing dormant in stock. 🎉</div>;
  }
  const shown = items.slice(0, limit);
  return (
    <>
      {shown.map((it) => (
        <div className="slow-card" key={it.product_id}>
          <TbAlertTriangle className="warn" size={18} />
          <div>
            <div className="name">{it.description || `Product ${it.product_id}`}</div>
            <div className="meta">
              {it.days_ago == null
                ? "In stock with no sales or purchases yet."
                : `No sales or purchases in ${it.days_ago} day${it.days_ago === 1 ? "" : "s"}.`}
            </div>
          </div>
        </div>
      ))}
      {items.length > limit && (
        <div className="report-panel-empty" style={{ paddingTop: 6 }}>
          + {items.length - limit} more
        </div>
      )}
    </>
  );
}
