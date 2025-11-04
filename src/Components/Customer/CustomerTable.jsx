import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import Draggable from "react-draggable";

function CustomerTable({ customers, onRefreshCustomers }) {
  const columns = [
    {
      name: "ID",
      selector: (row) => row.customerID,
      sortable: true,
      grow: 0,
      width: "100px",
    },
    {
      name: "Name",
      selector: (row) => row.customerName,
      sortable: true,
      wrap: true,
      grow: 3,
      minWidth: "200px",
    },
    {
      name: "Number",
      selector: (row) => row.customerContact,
      sortable: true,
      grow: 0,
      minWidth: "150px",
    },
    {
      name: "TIN",
      selector: (row) => row.customerTIN || "N/A",
      sortable: false,
      grow: 2,
      minWidth: "140px",
    },
    {
      name: "Terms",
      selector: (row) => row.customerTerms || "N/A",
      sortable: false,
      grow: 1,
      minWidth: "100px",
    },
    {
      name: "Address",
      selector: (row) => row.customerAddress,
      sortable: true,
      grow: 3,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEditCustomerClick(row)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDeleteCustomer(row.customerID)}
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

  const API_URL = import.meta.env.VITE_API_URL;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerTIN, setCustomerTIN] = useState("");
  const [customerTerms, setCustomerTerms] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // ✅ When customers change, re-apply search if active
    if (searchTerm.trim() !== "") {
      const filtered = customers.filter((row) =>
        Object.values(row).some((field) =>
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(customers);
    }
  }, [customers, searchTerm]);

  // 🕒 Auto-refresh only when not searching
  useEffect(() => {
    if (searchTerm.trim() !== "") return; // ⛔ Pause refresh if searching

    const interval = setInterval(() => {
      onRefreshCustomers();
    }, 120000);

    return () => clearInterval(interval);
  }, [onRefreshCustomers, searchTerm]);

  // 🔍 Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = customers.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleAddCustomerClick = () => {
    setCustomerName("");
    setCustomerContact("");
    setCustomerAddress("");
    setCustomerTIN("");
    setCustomerTerms("");
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    onRefreshCustomers();
    // Clear form fields when closing
    setCustomerName("");
    setCustomerContact("");
    setCustomerAddress("");
    setCustomerTIN("");
    setCustomerTerms("");
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();

    try {
      const newCustomer = {
        customerName,
        customerContact,
        customerAddress,
        customerTIN,
        customerTerms,
      };

      Swal.fire({
        title: "Adding Customer",
        text: "Please wait while we add a new customer...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Wait for the POST request to finish
      await axios.post(`${API_URL}/customers`, newCustomer);

      // Close the loading Swal before showing success
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Customer Added",
        text: "The customer has been added successfully!",
        showConfirmButton: false,
        timer: 1000,
      });

      onRefreshCustomers();
      handleCloseCustomerModal();
    } catch (error) {
      Swal.close(); // close the loader if an error occurs

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleEditCustomerClick = (customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.customerName);
    setCustomerContact(customer.customerContact);
    setCustomerAddress(customer.customerAddress);
    setCustomerTIN(customer.customerTIN || "");
    setCustomerTerms(customer.customerTerms || "");
    setShowEditModal(true);
  };

  const handleSubmitEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const updatedCustomer = {
        customerName,
        customerContact: `'${customerContact}`,
        customerAddress,
        customerTIN,
        customerTerms,
      };
      await axios.put(
        `${API_URL}/customers/${editingCustomer.customerID}`,
        updatedCustomer
      );

      Swal.fire({
        icon: "success",
        title: "Customer Updated",
        text: "Customer details updated successfully!",
        showConfirmButton: false,
        timer: 1000,
      });

      onRefreshCustomers();
      handleCloseCustomerModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#d33",
      });
    }
    setShowEditModal(false);
  };

  const handleDeleteCustomer = async (customerID) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `This will permanently delete customer ${customerID}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return; // Stop if user cancels

      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete the customer.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.delete(`${API_URL}/customers/${customerID}`);

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `Customer ${customerID} deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      onRefreshCustomers(); // Refresh customer list
    } catch (err) {
      Swal.close();
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete customer.",
      });
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
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

        {/* Add Customer button */}
        <button
          type="button"
          className="btn"
          style={{
            backgroundColor: "#1E5A84",
            color: "white",
            whiteSpace: "nowrap",
          }}
          onClick={handleAddCustomerClick}
        >
          + Add Customer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={20}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="450px"
        className="custom-data-table"
      />

      {/* Add Customer Modal */}
      <div
        className={`modal fade ${showCustomerModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showCustomerModal ? "block" : "none" }}
        aria-hidden={!showCustomerModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg border-0">
            {/* Header with gradient background */}
            <div
              className="modal-header text-white position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                borderRadius: "0.5rem 0.5rem 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="modal-title mb-0">Add New Customer</h5>
                  <small className="opacity-75">
                    Create a new customer record
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white p-4"
                onClick={handleCloseCustomerModal}
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
                  {/* Customer Name */}
                  <div className="col-12">
                    <label
                      htmlFor="customerName"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-user-tie me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      placeholder="Enter customer/company name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="form-control"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  {/* Contact Number & Customer TIN Side by Side */}
                  <div className="col-md-6 col-12">
                    <label
                      htmlFor="contactName"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-user me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Contact Number
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      placeholder="Enter contact number"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="form-control"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  <div className="col-md-6 col-12">
                    <label
                      htmlFor="CustomerTIN"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-id-card me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer TIN
                    </label>
                    <input
                      type="text"
                      id="CustomerTIN"
                      placeholder="Enter TIN"
                      value={customerTIN}
                      onChange={(e) => setCustomerTIN(e.target.value)}
                      className="form-control"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  {/* Customer Terms */}
                  <div className="col-12">
                    <label
                      htmlFor="CustomerTerms"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-id-card me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer Terms
                    </label>
                    <input
                      type="text"
                      id="CustomerTerms"
                      placeholder="Enter terms"
                      value={customerTerms}
                      onChange={(e) => setCustomerTerms(e.target.value)}
                      className="form-control"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  {/* Customer Address */}
                  <div className="col-12">
                    <label
                      htmlFor="customerAddress"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-map-marker-alt me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer Address
                    </label>
                    <textarea
                      id="customerAddress"
                      placeholder="Enter complete customer address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="form-control"
                      rows="3"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        resize: "vertical",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer bg-light border-0 rounded-bottom">
              <button
                type="button"
                className="btn px-4 py-2 me-2"
                onClick={handleCloseCustomerModal}
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
                onClick={handleSubmitCustomer}
                disabled={!customerName || !customerContact || !customerAddress}
                style={{
                  backgroundColor:
                    !customerName || !customerContact || !customerAddress
                      ? "#6c757d"
                      : "#1E5A84",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  cursor:
                    !customerName || !customerContact || !customerAddress
                      ? "not-allowed"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (customerName && customerContact && customerAddress) {
                    e.target.style.backgroundColor = "#1e3c72";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (customerName && customerContact && customerAddress) {
                    e.target.style.backgroundColor = "#1E5A84";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <i className="fas fa-user-plus me-2"></i>
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop for Add Customer */}
      {showCustomerModal && (
        <div
          className="modal-backdrop fade show"
          onClick={handleCloseCustomerModal}
        ></div>
      )}

      {/* Edit Customer Modal */}
      <div
        className={`modal fade ${showEditModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showEditModal ? "block" : "none" }}
        aria-hidden={!showEditModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg w-50">
          <div className="modal-content shadow-lg border-0">
            {/* Header with gradient background */}
            <div
              className="modal-header text-white position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                borderRadius: "0.5rem 0.5rem 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="modal-title mb-0">Edit Customer</h5>
                  <small className="opacity-75">
                    Update existing customer record
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white p-4"
                onClick={() => setShowEditModal(false)}
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
                  {/* Customer Name */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-user-tie me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter customer/company name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  {/* Contact & TIN Side by Side */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-phone me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Contact Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter contact number"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-id-card me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer TIN
                    </label>
                    <input
                      type="text"
                      placeholder="Enter TIN"
                      value={customerTIN}
                      onChange={(e) => setCustomerTIN(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  {/* Customer Terms */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-file-signature me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer Terms
                    </label>
                    <input
                      type="text"
                      placeholder="Enter terms"
                      value={customerTerms}
                      onChange={(e) => setCustomerTerms(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  {/* Customer Address */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-map-marker-alt me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Customer Address
                    </label>
                    <textarea
                      placeholder="Enter complete customer address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer bg-light border-0 rounded-bottom">
              <button
                type="button"
                className="btn px-4 py-2 me-2"
                onClick={() => setShowEditModal(false)}
                style={{ backgroundColor: "#6c757d", color: "white" }}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="button"
                className="btn px-4 py-2"
                onClick={handleSubmitEditCustomer}
                disabled={!customerName || !customerContact || !customerAddress}
                style={{
                  backgroundColor:
                    !customerName || !customerContact || !customerAddress
                      ? "#6c757d"
                      : "#1E5A84",
                  color: "white",
                }}
              >
                <i className="fas fa-user-edit me-2"></i>
                Update Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showEditModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowEditModal(false)}
        ></div>
      )}
    </div>
  );
}

export default CustomerTable;
