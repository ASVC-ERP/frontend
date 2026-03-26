import { FaEdit, FaTrash } from "react-icons/fa";

export const createCustomerColumns = (handleEdit, handleDelete) => [
  {
    name: "Name",
    selector: (row) => row.name,
    wrap: true,
    width: "250px",
  },
  {
    name: "PIC",
    selector: (row) => row.pic,
    width: "130px",
    wrap: true,
  },
  {
    name: "Number",
    selector: (row) => row.number,
    width: "150px",
  },
  {
    name: "Address",
    selector: (row) => row.address,
    width: "400px",
    wrap: true,
  },
  {
    name: "City",
    selector: (row) => row.city,
    width: "200px",
    wrap: true,
  },
  {
    name: "TIN",
    selector: (row) => row.tin || "N/A",
    width: "150px",
  },
  {
    name: "Terms",
    selector: (row) => row.terms || "N/A",
    grow: 1,
    minWidth: "100px",
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