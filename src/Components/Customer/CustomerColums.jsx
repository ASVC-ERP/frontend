import { FaEdit, FaTrash } from "react-icons/fa";

export const createCustomerColumns = (handleEdit, handleDelete) => [
  {
    name: "Name",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.name || "N/A"}
      </div>
    ),
    wrap: true,
    grow: 1,
  },
  {
    name: "PIC",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.pic || "N/A"}
      </div>
    ),
    grow: 1,
    wrap: true,
  },
  {
    name: "Number",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.number || "N/A"}
      </div>
    ),
    grow: 1,
  },
  {
    name: "Address",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.address || "N/A"}
      </div>
    ),
    grow: 2,
    wrap: true,
  },
  {
    name: "City",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.city || "-"}
      </div>
    ),
    width: "150px",
  },
  {
    name: "TIN",
    center: true,
    selector: (row) => row.tin || "N/A",
    width: "150px",
  },
  {
    name: "Terms",
    width: "150px",
    center: true,
    selector: (row) => row.terms || "N/A",
    wrap: true
  },
  {
    name: "Actions",
    cell: (row) => (
      <div className="d-flex gap-2">
        <button
          className="btn-secondary-custom"
          onClick={() => handleEdit(row)}
        >
          Edit
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "120px",
  },
];