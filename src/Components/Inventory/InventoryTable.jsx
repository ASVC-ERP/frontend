import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import { IoIosSearch } from "react-icons/io";

// Define table columns
const columns = [
  { name: "Product ID", selector: (row) => row.itemCode, sortable: true },
  { name: "Product Name", selector: (row) => row.itemName, sortable: true },
  { name: "Brand", selector: (row) => row.brand, sortable: true },
  { name: "Origin", selector: (row) => row.origin, sortable: true },
  { name: "Stock", selector: (row) => row.stock, sortable: true },
  {
    name: "Cost per product",
    selector: (row) => row.price1,
    sortable: true,
  },
];

function InventoryTable({ products=[], onAddItem = () => {} }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
  setFilteredData(Object.values(products));
}, [products]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(products).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleAddItemClick = () => {
    if (!itemCode || !itemName || !brand || !origin) return;

    const trimmedItem = {
      itemCode: itemCode.trim(),
      itemName: itemName.trim(),
      brand: brand.trim(),
      origin: origin.trim(),
    };

    if (
      !trimmedItem.itemCode ||
      !trimmedItem.itemName ||
      !trimmedItem.brand ||
      !trimmedItem.origin
    ) {
      alert("Please fill in all item details.");
      return;
    }

    const newItem = {
      ...trimmedItem,
      stock: 0,
      price1: 0,
      price2: 0,
      price3: 0,
      price4: 0,
    };

    onAddItem(newItem);

    // Reset inputs
    setItemCode("");
    setItemName("");
    setBrand("");
    setOrigin("");
  };

  const handleRowClick = (row) => {
    console.log("CLICKED", row); // Log the clicked row data
    navigate("/inventory/item",  { state: { row } }  ); // Navigate to the details page with the selected row data
  };


  return (
    <div>
      <div>
        <div className="d-flex justify-content-between align-items-center">
          {/* Search input field */}
          <div className="position-relative w-25 my-3">
            <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search inventory"
              value={searchTerm}
              onChange={handleSearch}
              className="form-control ps-5 border-2 rounded-3"
            />
          </div>

{/* Refactored Add Item Button
          <Link to="/add-item">
            <button
              type="button"
              className="btn me-5"
              style={{ backgroundColor: "#0C1D61", color: "white" }}
            >
              + Add Inventory
            </button>
          </Link>
*/}
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Item Code"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            className="form-control"
            style={{ maxWidth: "150px" }}
          />
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="form-control"
            style={{ maxWidth: "200px" }}
          />
          <input
            type="text"
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="form-control"
            style={{ maxWidth: "200px" }}
          />
          <input
            type="text"
            placeholder="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="form-control"
            style={{ maxWidth: "200px" }}
          />

          <button
            type="button"
            className="btn"
            style={{ backgroundColor: "#0C1D61", color: "white", whiteSpace: "nowrap" }}
            onClick={handleAddItemClick}
          >
            + Add Item
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="500px"
          onRowClicked={handleRowClick}
          className="custom-data-table"
        />
      </div>
    </div>
  );
}

export default InventoryTable;
