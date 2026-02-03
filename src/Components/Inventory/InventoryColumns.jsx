import { FaTrash } from "react-icons/fa";

export const productColumns = (handleDeleteItem) => [
    {
      name: "Product Code",
      selector: (row) => row.itemCode || row.item_code,
      width: "200px",
    },
    {
      name: "Product Name",
      selector: (row) => row.itemName || row.item_name,
      width: "550px",
      wrap: true,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      width: "100px",
      left: true
    },
    {
      name: "Price",
      selector: (row) => row.price4 ?? 0,
      width: "100px",
      left: true
    },
    {
      name: "Unit",
      width: "100px",
      selector: (row) => row.unit,
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
      maxWidth: "100px",
      center: true,
    },
];