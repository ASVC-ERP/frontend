import { TbAlertTriangle } from "react-icons/tb";

// items: [{ product_id, description, last_sold, days_ago }]
export default function SlowMovingCards({ items, limit = 5 }) {
  if (!items.length) {
    return <div className="report-panel-empty">Nothing slow-moving in stock. 🎉</div>;
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
                ? "In stock but never sold."
                : `Last sold ${it.days_ago} day${it.days_ago === 1 ? "" : "s"} ago.`}
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
