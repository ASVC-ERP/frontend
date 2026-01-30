import { FaTrash } from "react-icons/fa";

export const productColumns = (handleDeleteItem) => [
    {
      name: "Product Code",
      selector: (row) => row.itemCode || row.item_code,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Product Name",
      selector: (row) => row.itemName || row.item_name,
      sortable: true,
      grow: 3,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      sortable: true,
      maxWidth: "80px",
      left: true
    },
    {
      name: "Cost",
      selector: (row) => row.cost ?? 0,
      sortable: true,
      maxWidth: "100px",
      left: true
    },
    {
      name: "Brand",
      selector: (row) => row.brand,
      sortable: true,
    },
    {
      name: "Origin",
      selector: (row) => row.origin,
      sortable: true,
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
      maxWidth: "100px",
      center: true,
    },
];