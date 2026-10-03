import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { debug } from "../../utils/log";

export const productColumns = (handleDeleteItem, handleToggleStatus) => [
  {
    name: "Code",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.itemCode || row.item_code || "N/A"}
      </div>
    ),
    width: "180px",
    wrap: true,
  },
  {
    name: "Description",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.itemName || row.item_name || "N/A"}
      </div>
    ),
    grow: 2,
    wrap: true,
  },
  {
    name: "Stock",
    width: "100px",
    center: true,
    cell: (row) => {
      const stock = Number(row.stock);
      const minStock = Number(row.minStock ?? row.min_stock);

      let color = "inherit";
      let icon = "";

      if (!isNaN(stock) && !isNaN(minStock)) {
        if (stock === 0) {
          color = "#dc3545"; // red
        } else if (stock <= minStock) {
          color = "#ffc107"; // yellow
        } else {
          color = "#198754"; // green
        }
      }

      return (
        <span
          style={{
            color,
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {icon && <span>{icon}</span>}
          {row.stock ?? "—"}
        </span>
      );
    }
  },
  {
    name: "Price",
    width: "120px",
    selector: (row) =>
      row.price4 != null
        ? `₱${Number(row.price4).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "—",
    center: true
  },
  {
    name: "Unit",
    width: "90px",
    selector: (row) => row.unit,
    center: true
  },
  {
    name: "Brand",
    width: "120px",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.brand || "N/A"}
      </div>
    ),
  },
  {
    name: "Model",
    width: "150px",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.model || "N/A"}
      </div>
    ),
    wrap: true
  },
  {
    name: "Origin",
    width: "130px",
    center: true,
    selector: (row) => row.origin,
  },
  {
    name: "Status",
    width: "120px",
    center: true,
    cell: (row) => {
      const inactive = row.status === "inactive";
      return (
        <span
          style={{
            display: "inline-block",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
            padding: "2px 10px",
            borderRadius: 999,
            background: inactive ? "#fef2f2" : "#f0fdf4",
            color: inactive ? "#dc2626" : "#16a34a",
          }}
        >
          {inactive ? "Inactive" : "Active"}
        </span>
      );
    },
  },
  {
    name: "Actions",
    cell: (row) => {
      const inactive = row.status === "inactive";
      return (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`btn ${inactive ? "btn-outline-success" : "btn-outline-secondary"}`}
            style={{ padding: "6px 12px", lineHeight: 0 }}
            title={inactive ? "Mark Active" : "Mark Inactive"}
            onClick={() => handleToggleStatus(row.itemID, inactive ? "active" : "inactive")}
          >
            {inactive ? <FaToggleOff size={24} /> : <FaToggleOn size={24} />}
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              debug("Row data:", row);
              handleDeleteItem( row.itemID );
            }}
          >
            <FaTrash />
          </button>
        </div>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "160px",
    center: true,
  },
];