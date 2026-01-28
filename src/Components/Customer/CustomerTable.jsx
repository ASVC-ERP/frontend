import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useDraggableModal } from "../../hooks/useDraggableModal";
import { createCustomerColumns } from "./CustomerColums";
import { useCustomerHandlers } from "./CustomerHandler";

function CustomerTable({ customers, onRefreshCustomers }) {

  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const {
    searchTerm,
    filteredData,
    handleSearch,
    showCustomerModal,
    setShowCustomerModal,
    customerName,
    setCustomerName,
    contactPerson,
    setContactPerson,
    customerContact,
    setCustomerContact,
    customerAddress,
    setCustomerAddress,
    customerTIN,
    setCustomerTIN,
    customerTerms,
    setCustomerTerms,
    showEditModal,
    setShowEditModal,
    handleAddCustomerClick,
    handleCloseCustomerModal,
    handleSubmitCustomer,
    handleEditCustomerClick,
    handleSubmitEditCustomer,
    handleDeleteCustomer,
  } = useCustomerHandlers(customers, onRefreshCustomers);

  const columns = createCustomerColumns(
    handleEditCustomerClick,
    handleDeleteCustomer
  );

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        {/* Search input field */}
        <div className="position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search customer name"
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
        paginationRowsPerPageOptions={[10, 25, 50, 100, 200]}
        paginationPerPage={50}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="700px"
        className="custom-data-table"
      />

      {/* Add Customer Modal */}
      <div
        className={`modal fade ${showCustomerModal ? "show" : ""}`}
        tabIndex="-1"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
                cursor: "move", // draggable handle
                userSelect: 'none'
              }}
              onMouseDown={handleHeaderMouseDown}
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
                  <div className="col-6">
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

                  <div className="col-6">
                    <label
                      htmlFor="contactPerson"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-user-tie me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      placeholder="Enter contact person name"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
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
                  <div className="col-6">
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

                  {/* Contact Person */}
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-user-tie me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Enter contact person name"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
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
