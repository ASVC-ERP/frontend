import { useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { IoIosSearch } from "react-icons/io";

const columns = [
  { name: "Supplier Name", selector: (row) => row.name, sortable: true },
  { name: "Supplier Address", selector: (row) => row.address, sortable: true },
  {
    name: "Date of Invoice",
    selector: (row) => row.invoiceDate,
    sortable: true,
  },
  { name: "Quantity", selector: (row) => row.quantity, sortable: true },
  { name: "Item / s", selector: (row) => row.items, sortable: true },
  { name: "Descriptions", selector: (row) => row.description, sortable: true },
  { name: "Gross Price", selector: (row) => row.gPrice, sortable: true },
  { name: "Discounts", selector: (row) => row.discount, sortable: true },
  { name: "Net Price", selector: (row) => row.nPrice, sortable: true },
  {
    name: "Total Value of Invoice",
    selector: (row) => row.totalValue,
    sortable: true,
  },
];

function SupplierTable({ supplier }) {
//   const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(Object.values(supplier));

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(supplier).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

//   const handleRowClick = (row) => {
//     console.log("CLICKED", row); // Log the clicked row data
//     navigate("/supplier/item", { state: { row } }); // Navigate to the details page with the selected row data
//   };

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

          <Link to="/add-item">
            <button
              type="button"
              className="btn me-5"
              style={{ backgroundColor: "#0C1D61", color: "white" }}
            >
              + Add Supplier
            </button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="500px"
        //   onRowClicked={handleRowClick}
          className="custom-data-table"
        />
      </div>
    </div>
  );
}

export default SupplierTable;
