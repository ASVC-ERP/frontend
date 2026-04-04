import { FaTrash } from "react-icons/fa";

export const productColumns = (handleDeleteItem) => [
  {
    name: "Code",
    selector: (row) => row.itemCode || row.item_code,
    width: "200px",
  },
  {
    name: "Description",
    selector: (row) => row.itemName || row.item_name,
    width: "450px",
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
        if (stock < minStock) {
          color = "#dc3545"; // red
          icon = "⛔"; // danger
        } else if (stock === minStock) {
          color = "#ffc107"; // yellow
          icon = "⚠️"; // warning
        } else {
          color = "#198754"; // optional green
          icon = ""; // or "✔️"
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
    selector: (row) => row.unit.toUpperCase(),
    center: true
  },
  {
    name: "Brand",
    width: "150px",
    selector: (row) => row.brand,
  },
  {
    name: "Model",
    width: "200px",
    selector: (row) => row.model,
    wrap: true
  },
  {
    name: "Origin",
    grow: 2,
    minWidth: "150px",
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
    width: "70px",
    center: true,
  },
];