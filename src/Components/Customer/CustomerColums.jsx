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
    width: "290px",
  },
  {
    name: "PIC",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.pic || "N/A"}
      </div>
    ),
    width: "220px",
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
    width: "170px",
  },
  {
    name: "Address",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.address || "N/A"}
      </div>
    ),
    width: "300px",
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
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.tin || "-"}
      </div>
    ),
    width: "180px",
  },
  {
    name: "Terms",
    width: "120px",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
        {row.terms || "N/A"}
      </div>
    ),
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