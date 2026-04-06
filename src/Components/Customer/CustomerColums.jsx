import { FaEdit, FaTrash } from "react-icons/fa";

export const createCustomerColumns = (handleEdit, handleDelete) => [
  {
    name: "Name",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left" }}>
        {row.name || "N/A"}
      </div>
    ),
    wrap: true,
    width: "300px",
  },
  {
    name: "PIC",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left" }}>
        {row.pic || "N/A"}
      </div>
    ),
    width: "250px",
    wrap: true,
  },
  {
    name: "Number",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left" }}>
        {row.number || "N/A"}
      </div>
    ),
    width: "170px",
  },
  {
    name: "Address",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left" }}>
        {row.address || "N/A"}
      </div>
    ),
    width: "450px",
    wrap: true,
  },
  {
    name: "TIN",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left" }}>
        {row.tin || "N/A"}
      </div>
    ),
    width: "200px",
  },
  {
    name: "Terms",
    selector: (row) => row.terms || "N/A",
    width: "150px",
    center: true,
    cell: (row) => (
      <div style={{ width: "100%", textAlign: "left" }}>
        {row.terms || "N/A"}
      </div>
    ),
  },
  {
    name: "Actions",
    cell: (row) => (
      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleEdit(row)}
        >
          <FaEdit />
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(row.id)}
        >
          <FaTrash />
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    grow: 0,
    width: "120px",
  },
];