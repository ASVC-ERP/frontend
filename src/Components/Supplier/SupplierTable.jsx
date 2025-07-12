import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { IoIosSearch } from "react-icons/io";
import axios from "axios";

const columns = [
  { name: "Supplier Code", selector: (row) => row.id, sortable: true },
  { name: "Supplier Name", selector: (row) => row.name, sortable: true },
  { name: "Supplier Address", selector: (row) => row.address, sortable: true },
];

function SupplierTable({ supplier }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]); //useState(Object.values(supplier));

  // New local state for the form inputs
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  // 🔄 Sync with latest supplier prop
  useEffect(() => {
    setFilteredData(supplier);
  }, [supplier]);

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


  const handleRowClick = (row) => {
    console.log("CLICKED", row); // Log the clicked row data
    navigate("/supplier/invoices", { state: { row } }); // Navigate to the details page with the selected row data
  };

  const handleAddSupplier = async () => {
    if (!newName.trim() || !newAddress.trim()) return;

    const newSupplier = {
      id: newCode,
      name: newName,
      address: newAddress,
    };

    try {
      await axios.post("http://localhost:3000/suppliers", newSupplier);
      onAddSupplier(newSupplier);
      setNewCode("");
      setNewName("");
      setNewAddress("");
    } catch (error) {
      console.error("Failed to add supplier:", error);
    }
  };


  return (
    <div className="container-fluid">
      <div className="my-3">
        <div className="position-relative mb-3" style={{ maxWidth: "460px" }}>
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search inventory"
            value={searchTerm}
            onChange={handleSearch}
            className="form-control ps-5 border-2 rounded-3"
          />
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Supplier Code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="form-control"
            style={{ maxWidth: "150px" }}
          />

          <input
            type="text"
            placeholder="Supplier Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="form-control"
            style={{ maxWidth: "300px" }}
          />

          <input
            type="text"
            placeholder="Supplier Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="form-control"
            style={{ maxWidth: "600px" }}
          />

          <button
            type="button"
            className="btn"
            style={{ backgroundColor: "#0C1D61", color: "white", whiteSpace: "nowrap" }}
            onClick={handleAddSupplier}
          >
            + Add Supplier
          </button>
        </div>

        {/* 📋 Data Table */}
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

export default SupplierTable;
