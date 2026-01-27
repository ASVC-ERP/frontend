import { FaTrash } from "react-icons/fa";

export const productColumns = (handleDeleteItem) => [
    {
      name: "Product Code",
      selector: (row) => row.itemCode || row.item_code,
      sortable: true,
      grow: 2,
      minWidth: "150px",
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
      name: "Brand",
      selector: (row) => row.brand,
      sortable: true,
      grow: 1, // smaller
      maxWidth: "120px",
    },
    {
      name: "Origin",
      selector: (row) => row.origin,
      sortable: true,
      grow: 1,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      sortable: true,
      grow: 1,
      maxWidth: "80px",
      center: true,
    },
    {
      name: "Price",
      selector: (row) => row.price1 ?? 0,
      sortable: true,
      grow: 1,
      maxWidth: "100px",
      right: true,
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
      grow: 0,
      maxWidth: "100px",
      center: true,
    },
];