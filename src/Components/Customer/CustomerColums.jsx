import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaChartLine } from "react-icons/fa";
import "../../styles/buttons.css";

export const createCustomerColumns = (handleEdit, handleDelete, isAdmin) => [
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
    grow: 1,
  },
  {
    name: "TIN",
    center: true,
    selector: (row) => row.tin || "N/A",
    width: "150px",
    wrap: true
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
          className="btn-edit"
          onClick={() => handleEdit(row)}
        >
          <FaEdit />
        </button>
        {isAdmin && (
          <Link
            to={`/reports/customers/detail/${row.id}`}
            className="btn-edit-gray"
            title="View customer report"
          >
            <FaChartLine />
          </Link>
        )}
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: isAdmin ? "160px" : "120px",
  },
];