import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { IoIosSearch } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

function SupplierTable({ supplier, onAddSupplier, onRefreshSupplier }) {
  const columns = [
    { name: "Supplier Code", selector: (row) => row.id, sortable: true, width: "150px" },
    { name: "Supplier Name", selector: (row) => row.name, sortable: true },
    {
      name: "Currency",
      selector: (row) => row.currency,
      sortable: true,
      width: "120px",
    },
    { name: "Number", selector: (row) => row.number, sortable: false, width: "120px" },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEditSupplier(row)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              console.log("Row data:", row);
              handleDeleteSupplier(row.id);
            }}
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const handleEditSupplier = (row) => {
    console.log("Editing row:", row);
    setSelectedInvoice(row); // set invoice/supplier row for modal
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectedInvoice(null);
    setShowEditModal(false);
  };

  const handleAddSupplierClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Clear form fields when closing
    setNewCode("");
    setNewName("");
    setNewAddress("");
    setNewCurrency("");
    setNewNumber("");
  };

  useEffect(() => {
    setFilteredData(supplier);
  }, [supplier]);

  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshSupplier();
    }, 120000);

    return () => clearInterval(interval);
  }, [onRefreshSupplier]);

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

  const handleUpdateSupplier = async () => {
    try {
      await axios.put(`http://localhost:3000/suppliers/${selectedInvoice.id}`, {
        name: selectedInvoice.name,
        address: selectedInvoice.address,
        currency: selectedInvoice.currency,
      });

      Swal.fire({
        icon: "success",
        title: "Supplier Updated",
        text: "Supplier details have been successfully updated.",
        confirmButtonColor: "#0C1D61",
      });

      onRefreshSupplier();

      setShowEditModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#0C1D61",
      });
    }
  };

  const handleSubmitSupplier = () => {
    console.log("▶ Add Item Clicked");
    if (!newCode.trim() || !newName.trim() || !newAddress.trim()) return;

    const newSupplier = {
      id: newCode,
      name: newName,
      address: newAddress,
      currency: newCurrency,
      number: newNumber, // Default value; can be updated later
    };

    onAddSupplier(newSupplier);
    setNewCode("");
    setNewName("");
    setNewAddress("");
    setNewCurrency("");
    setNewNumber("");

    onRefreshSupplier();
    // Close modal and clear fields
    handleCloseModal();
  };

  const handleDeleteSupplier = async (supplierID) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This supplier will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/suppliers/${supplierID}`);

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Supplier deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      onRefreshSupplier(); // 👈 refresh supplier list
    } catch (err) {
      console.error("Error deleting supplier:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Failed to delete supplier. Please try again.",
      });
    }
  };

  return (
    <div className="container-fluid">
      <div className="my-3">
        <div
          className="d-flex align-items-center justify-content-between mb-4"
          style={{ gap: "10px" }}
        >
          {/* Search box */}
          <div
            className="position-relative flex-grow-1"
            style={{ maxWidth: "310px" }}
          >
            <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search inventory"
              value={searchTerm}
              onChange={handleSearch}
              className="form-control ps-5 border-2 rounded-3"
            />
          </div>

          {/* Add Supplier button */}
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "#0C1D61",
              color: "white",
              whiteSpace: "nowrap",
            }}
            onClick={handleAddSupplierClick}
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

      {/* Add Supplier Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showModal ? "block" : "none" }}
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg w-50">
          <div className="modal-content shadow-lg border-0">
            {/* Header with gradient background */}
            <div
              className="modal-header text-white position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
                borderRadius: "0.5rem 0.5rem 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="modal-title mb-0">Add New Supplier</h5>
                  <small className="opacity-75">
                    Create a new supplier record
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white p-4"
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>

              {/* Decorative elements */}
              <div
                className="position-absolute"
                style={{
                  top: "-50px",
                  right: "-50px",
                  width: "100px",
                  height: "100px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              ></div>
              <div
                className="position-absolute"
                style={{
                  bottom: "-30px",
                  left: "-30px",
                  width: "60px",
                  height: "60px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "50%",
                }}
              ></div>
            </div>

            <div className="modal-body p-4">
              <form>
                <div className="row g-3">
                  {/* Supplier Code */}
                  <div className="row">
                    <div className="col-md-4">
                      <label
                        htmlFor="supplierCode"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-barcode me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Code
                      </label>
                      <input
                        type="text"
                        id="supplierCode"
                        placeholder="Enter supplier code"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>

                    {/* Supplier Name */}
                    <div className="col-md-8">
                      <label
                        htmlFor="supplierName"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-building me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        id="supplierName"
                        placeholder="Enter supplier name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Supplier Currency */}
                    <div className="col-md-4">
                      <label
                        htmlFor="supplierCurrency"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-dollar-sign me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Currency
                      </label>
                      <input
                        type="text"
                        id="supplierCurrency"
                        placeholder="Enter currency"
                        value={newCurrency}
                        onChange={(e) => setNewCurrency(e.target.value)}
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>

                    {/* Supplier Number */}
                    <div className="col-md-8">
                      <label
                        htmlFor="supplierNumber"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-dollar-sign me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Number
                      </label>
                      <input
                        type="text"
                        id="supplierNumber"
                        placeholder="Enter number"
                        value={newNumber}
                        onChange={(e) => setNewNumber(e.target.value)}
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Supplier Address */}
                    <div className="col-12">
                      <label
                        htmlFor="supplierAddress"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-map-marker-alt me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Address
                      </label>
                      <textarea
                        id="supplierAddress"
                        placeholder="Enter supplier address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="form-control"
                        rows="3"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          resize: "vertical",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Additional info card */}
              <div
                className="mt-4 p-3 rounded-3"
                style={{
                  backgroundColor: "rgba(12, 29, 97, 0.05)",
                  border: "1px solid rgba(12, 29, 97, 0.1)",
                }}
              >
                <div className="d-flex align-items-center">
                  <i
                    className="fas fa-info-circle me-2"
                    style={{ color: "#0C1D61" }}
                  ></i>
                  <small className="text-muted">
                    Please ensure all information is accurate before submitting.
                  </small>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-0 rounded-bottom">
              <button
                type="button"
                className="btn px-4 py-2 me-2"
                onClick={handleCloseModal}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#5a6268";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#6c757d";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="button"
                className="btn px-4 py-2"
                onClick={handleSubmitSupplier}
                disabled={!newCode || !newName || !newAddress}
                style={{
                  backgroundColor:
                    !newCode || !newName || !newAddress ? "#6c757d" : "#0C1D61",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  cursor:
                    !newCode || !newName || !newAddress
                      ? "not-allowed"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!(!newCode || !newName || !newAddress)) {
                    e.target.style.backgroundColor = "#1e3c72";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!newCode || !newName || !newAddress)) {
                    e.target.style.backgroundColor = "#0C1D61";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showModal && (
        <div
          className="modal-backdrop fade show"
          onClick={handleCloseModal}
        ></div>
      )}

      {/* Edit Invoice Modal */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg w-50"
            role="document"
          >
            <div className="modal-content shadow-lg border-0">
              {/* Header with gradient background */}
              <div
                className="modal-header text-white position-relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <div className="d-flex align-items-center">
                  <div>
                    <h5 className="modal-title mb-0">Edit Supplier</h5>
                    <small className="opacity-75">
                      Modify supplier information
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white p-4"
                  onClick={() => handleCloseEditModal()}
                  aria-label="Close"
                ></button>

                {/* Decorative elements */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-50px",
                    right: "-50px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>
                
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-30px",
                    left: "-30px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>

              <div className="modal-body p-4">
                <form>
                  <div className="row g-3">
                    {/* Supplier ID (Read-only) */}
                    <div className="col-12">
                      <label
                        htmlFor="supplierId"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-id-badge me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier ID
                      </label>
                      <input
                        type="text"
                        id="supplierId"
                        className="ms-1 ps-2"
                        placeholder="Supplier ID"
                        value={selectedInvoice.id}
                        disabled
                        style={{
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          fontWeight: "500",
                        }}
                      />
                    </div>

                    {/* Supplier Name */}
                    <div className="col-12">
                      <label
                        htmlFor="supplierNameEdit"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-building me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        id="supplierNameEdit"
                        placeholder="Enter supplier name"
                        value={selectedInvoice.name}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            name: e.target.value,
                          })
                        }
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>

                    {/* Supplier Currency */}
                    <div className="col-6">
                      <label
                        htmlFor="supplierCurrencyEdit"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-money-bill-wave me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Currency
                      </label>
                      <input
                        type="text"
                        id="supplierCurrencyEdit"
                        placeholder="Enter supplier currency (e.g. USD, PHP, EUR)"
                        value={selectedInvoice.currency || ""}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            currency: e.target.value,
                          })
                        }
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>

                    {/* Supplier Number */}
                    <div className="col-6">
                      <label
                        htmlFor="supplierNumberEdit"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-money-bill-wave me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Number
                      </label>
                      <input
                        type="text"
                        id="supplierNumberEdit"
                        placeholder="Enter supplier number "
                        value={selectedInvoice.number || ""}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            number: e.target.value,
                          })
                        }
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>

                    {/* Supplier Address */}
                    <div className="col-12">
                      <label
                        htmlFor="supplierAddressEdit"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-map-marker-alt me-2"
                          style={{ color: "#0C1D61" }}
                        ></i>
                        Supplier Address{" "}
                      </label>
                      <textarea
                        id="supplierAddressEdit"
                        placeholder="Enter supplier address"
                        value={selectedInvoice.address}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            address: e.target.value,
                          })
                        }
                        className="form-control"
                        rows="3"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.90rem",
                          resize: "vertical",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#0C1D61")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </div>

                  </div>
                </form>

                {/* Additional info card */}
                <div
                  className="mt-4 p-3 rounded-3"
                  style={{
                    backgroundColor: "rgba(12, 29, 97, 0.05)",
                    border: "1px solid rgba(12, 29, 97, 0.1)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className="fas fa-info-circle me-2"
                      style={{ color: "#0C1D61" }}
                    ></i>
                    <small className="text-muted">
                      Changes will be saved immediately. Make sure all
                      information is accurate before saving.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-0 rounded-bottom">
                <button
                  type="button"
                  className="btn px-4 py-2 me-2"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#c82333";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#dc3545";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={handleUpdateSupplier}
                  disabled={
                    !selectedInvoice.name ||
                    !selectedInvoice.address ||
                    !selectedInvoice.currency
                  }
                  style={{
                    backgroundColor:
                      !selectedInvoice.name ||
                      !selectedInvoice.address ||
                      !selectedInvoice.currency
                        ? "#6c757d"
                        : "#0C1D61",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    cursor:
                      !selectedInvoice.name ||
                      !selectedInvoice.address ||
                      !selectedInvoice.currency
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      selectedInvoice.name &&
                      selectedInvoice.address &&
                      selectedInvoice.currency
                    ) {
                      e.target.style.backgroundColor = "#1e3c72";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      selectedInvoice.name &&
                      selectedInvoice.address &&
                      selectedInvoice.currency
                    ) {
                      e.target.style.backgroundColor = "#0C1D61";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierTable;
