import { FaEdit, FaTrash } from "react-icons/fa";

export const createCustomerColumns = (handleEdit, handleDelete) => [
  {
    name: "ID",
    selector: (row) => row.id,
    sortable: true,
    grow: 0,
    width: "100px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    wrap: true,
    grow: 2.5,
    minWidth: "150px",
  },
  {
    name: "PIC",
    selector: (row) => row.pic,
    sortable: true,
    wrap: true,
  },
  {
    name: "Number",
    selector: (row) => row.number,
    sortable: true,
    grow: 0,
    minWidth: "150px",
  },
  {
    name: "Address",
    selector: (row) => row.address,
    sortable: true,
    grow: 3,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "TIN",
    selector: (row) => row.tin || "N/A",
    sortable: false,
    grow: 1,
    minWidth: "140px",
  },
  {
    name: "Terms",
    selector: (row) => row.terms || "N/A",
    sortable: false,
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