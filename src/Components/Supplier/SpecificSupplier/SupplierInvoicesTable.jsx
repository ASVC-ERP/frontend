import DataTable from "react-data-table-component";
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useLocation } from "react-router-dom";

function SupplierInvoicesTable() {
  const location = useLocation();
  const supplier = location.state || {}; // Access the passed row
  const supplierName = supplier.row?.name || "Supplier"; // Fallback to "Supplier" if no name is provided

  const supplierInvoice = [
    {
      date: "2025-06-15",
      qty: 5,
      description: "Office Supplies - Pens, Papers, Folders",
      grossPrice: 1500,
      discount: 200,
      netPrice: 1300,
      total: 6500,
      items: [
        { name: "Pens", quantity: 2, price: 100 },
        { name: "Papers", quantity: 2, price: 500 },
        { name: "Folders", quantity: 1, price: 900 },
      ],
    },
    {
      date: "2025-06-12",
      qty: 3,
      description: "Printer Ink and Toner",
      grossPrice: 3000,
      discount: 500,
      netPrice: 2500,
      total: 7500,
      items: [
        { name: "Black Ink", quantity: 1, price: 1000 },
        { name: "Color Ink", quantity: 1, price: 1200 },
        { name: "Toner", quantity: 1, price: 1300 },
      ],
    },
    {
      date: "2025-06-10",
      qty: 10,
      description: "Laptop Accessories - Mice, Keyboards",
      grossPrice: 2000,
      discount: 0,
      netPrice: 2000,
      total: 20000,
      items: [
        { name: "Mouse", quantity: 5, price: 300 },
        { name: "Keyboard", quantity: 5, price: 500 },
      ],
    },
    {
      date: "2025-06-08",
      qty: 2,
      description: "External Hard Drives",
      grossPrice: 4000,
      discount: 400,
      netPrice: 3600,
      total: 7200,
      items: [
        { name: "Seagate HDD", quantity: 1, price: 3600 },
        { name: "WD HDD", quantity: 1, price: 3600 },
      ],
    },
  ];

  const columns = [
    { name: "Date of Invoice", selector: (row) => row.date, sortable: true },
    { name: "No. of Items", selector: (row) => row.qty, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Gross Price", selector: (row) => row.grossPrice, sortable: true },
    { name: "Discount", selector: (row) => row.discount, sortable: true },
    { name: "Net Price", selector: (row) => row.netPrice, sortable: true },
    { name: "Total Value", selector: (row) => row.total, sortable: true },
  ];

  const [selectedRow, setSelectedRow] = useState(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(
    Object.values(supplierInvoice)
  );

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(supplierInvoice).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleRowClick = (row) => {
    console.log("CLICKED", row); // Log the clicked row data
    setSelectedRow(row);
    setShowRowModal(true);
  };


  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <p
          className="h1 fw-bold mb-0 ms-3"
          style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
        >
          {supplierName} Invoices
        </p>
      </div>
      <div className="row table-responsive mx-3">
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

        {showRowModal && selectedRow && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div
              className="modal-dialog"
              role="document"
              style={{ maxWidth: "600px" }} // Adjust width as needed
            >
              <div className="modal-content">
                {/* Header */}
                <div className="modal-header d-flex flex-column align-items-start">
                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <p
                      className="mb-2"
                      style={{ color: "#05050599", fontSize: "12px" }}
                    >
                      Supplier &gt; Invoices &gt;{" "}
                      {selectedRow.invoiceId || "INV-001"}
                    </p>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowRowModal(false)}
                    ></button>
                  </div>
                  <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                    Invoice Date:{" "}
                    {new Date(selectedRow.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </h5>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div
                    className="rounded-3"
                    style={{ maxHeight: "250px", overflowY: "auto" }}
                  >
                    <ul className="list-unstyled">
                      {selectedRow.items.map((item, index) => (
                        <li key={index}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            {/* Item Info */}
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src="https://via.placeholder.com/40"
                                alt="Item"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                }}
                              />
                              <div className="d-flex flex-column">
                                <span className="fw-semibold">{item.name}</span>
                                <small className="text-muted">
                                  Qty: {item.quantity}
                                </small>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-end d-flex flex-column">
                              <span className="fw-semibold">
                                ₱
                                {(item.price * item.quantity).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Summary Section */}
                  <div className="pt-3 ms-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h6">Gross Price</span>
                      <span className="fw-bold">
                        ₱
                        {selectedRow.grossPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="h6">Discount</span>
                      <span className="fw-bold text-danger">
                        ₱
                        {selectedRow.discount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="h6">Net Price</span>
                      <span className="fw-bold">
                        ₱
                        {selectedRow.netPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="h5 fw-semibold">Total Value</span>
                      <span className="fw-bold h5">
                        ₱
                        {selectedRow.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer justify-content-end">
                  <button
                    className="btn"
                    style={{ backgroundColor: "#0C1D61", color: "white" }}
                    onClick={() => alert("Download or confirm action here")}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierInvoicesTable;
