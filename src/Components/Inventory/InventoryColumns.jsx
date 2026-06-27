import { FaTrash } from "react-icons/fa";

export const productColumns = (handleDeleteItem) => [
  {
    name: "Code",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.itemCode || row.item_code || "N/A"}
      </div>
    ),
    width: "200px",
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
    width: "400px",
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
    width: "100px",
    selector: (row) => row.unit,
    center: true
  },
  {
    name: "Brand",
    width: "150px",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.brand || "N/A"}
      </div>
    ),
  },
  {
    name: "Model",
    width: "200px",
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
    width: "150px",
    center: true,
    selector: (row) => row.origin,
  },
  {
    name: "Actions",
    cell: (row) => (
      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => {
            console.log("Row data:", row);
            handleDeleteItem( row.itemID );
          }}
        >
          <FaTrash />
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "150px",
    center: true,
  },
];