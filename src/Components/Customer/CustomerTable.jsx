import DataTable from "react-data-table-component";
import { forwardRef, useImperativeHandle } from "react";
import { useDraggableModal } from "../../hooks/useDraggableModal";
import { createCustomerColumns } from "./CustomerColums";
import { useCustomerHandlers } from "./CustomerHandler";

const CustomerTable = forwardRef(function CustomerTable(
  {
    customers = [],
    onRefreshCustomers = () => {},
    page,
    setPage,
    limit,
    setLimit,
    totalRows,
    progressPending,
    progressComponent,
  },
  ref
) {

  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const {
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
    customerCity,
    setCustomerCity,
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

  useImperativeHandle(ref, () => ({
    openAddModal: handleAddCustomerClick,
  }));

  const columns = createCustomerColumns(
    handleEditCustomerClick,
    handleDeleteCustomer
  );

  return (
    <div>
      <DataTable
        columns={columns}
        data={customers}
        pagination
        paginationServer
        paginationRowsPerPageOptions={[10, 25, 50, 100, 200]}
        paginationPerPage={limit}
        paginationTotalRows={totalRows}
        onChangePage={(page) => setPage(page)}
        onChangeRowsPerPage={(newLimit, page) => {
          setLimit(newLimit);
          setPage(page);
        }}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="650px"
        className="custom-data-table"
        progressPending={progressPending}
        progressComponent={progressComponent}
      />

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div
          className="app-modal-backdrop"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="app-modal">
            <div className="app-modal-content">

              <div
                className="app-modal-header"
                onMouseDown={handleHeaderMouseDown}
              >
                <div>
                  <h5>Add New Customer</h5>
                  <span>Create a new customer record</span>
                </div>

                <button
                  type="button"
                  className="app-modal-close"
                  onClick={handleCloseCustomerModal}
                >
                  ×
                </button>
              </div>

              <div className="app-modal-body">
                <form className="modal-form">

                  {/* CUSTOMER INFORMATION */}
                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Customer Information
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">
                          Customer Name
                        </label>

                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="form-control"
                          placeholder="Enter customer/company name"
                          maxLength={50}
                        />

                        <small
                          className={`modal-help-text ${
                            customerName.length >= 50
                              ? "danger"
                              : customerName.length >= 40
                              ? "warning"
                              : ""
                          }`}
                        >
                          {customerName.length}/50
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">
                          Contact Person
                        </label>

                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="form-control"
                          placeholder="Enter contact person"
                          maxLength={50}
                        />

                        <small
                          className={`modal-help-text ${
                            contactPerson.length >= 50
                              ? "danger"
                              : contactPerson.length >= 40
                              ? "warning"
                              : ""
                          }`}
                        >
                          {contactPerson.length}/50
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">
                          City
                        </label>

                        <input
                          type="text"
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="form-control"
                          placeholder="Enter city"
                          maxLength={50}
                        />

                        <small
                          className={`modal-help-text ${
                            customerCity.length >= 50
                              ? "danger"
                              : customerCity.length >= 40
                              ? "warning"
                              : ""
                          }`}
                        >
                          {customerCity.length}/50
                        </small>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">
                          Address
                        </label>

                        <textarea
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="form-control"
                          placeholder="Enter House No, Street, Barangay"
                          maxLength={150}
                        />

                        <small
                          className={`modal-help-text ${
                            customerAddress.length >= 150
                              ? "danger"
                              : customerAddress.length >= 100
                              ? "warning"
                              : ""
                          }`}
                        >
                          {customerAddress.length}/150
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* CONTACT DETAILS */}
                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Contact & Billing
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">
                          Contact Number
                        </label>

                        <input
                          type="text"
                          value={customerContact}
                          onChange={(e) => setCustomerContact(e.target.value)}
                          className="form-control"
                          placeholder="Enter contact number"
                          maxLength={50}
                        />

                        <small
                          className={`modal-help-text ${
                            customerContact.length >= 50
                              ? "danger"
                              : customerContact.length >= 40
                              ? "warning"
                              : ""
                          }`}
                        >
                          {customerContact.length}/50
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">
                          Customer TIN
                        </label>

                        <input
                          type="text"
                          value={customerTIN}
                          onChange={(e) => setCustomerTIN(e.target.value)}
                          className="form-control"
                          placeholder="Enter TIN"
                          maxLength={30}
                        />

                        <small
                          className={`modal-help-text ${
                            customerTIN.length >= 50
                              ? "danger"
                              : customerTIN.length >= 40
                              ? "warning"
                              : ""
                          }`}
                        >
                          {customerTIN.length}/30
                        </small>

                      </div>

                      <div className="col-md-4">
                        <label className="form-label">
                          Payment Terms
                        </label>

                        <input
                          type="text"
                          value={customerTerms}
                          onChange={(e) => setCustomerTerms(e.target.value)}
                          className="form-control"
                          placeholder="Enter terms"
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={handleCloseCustomerModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleSubmitCustomer}
                  disabled={
                    !customerName ||
                    !customerContact ||
                    !customerAddress
                  }
                >
                  Add Customer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal app-modal-md">
            <div className="app-modal-content">
              <div className="app-modal-header">
                <div>
                  <h5>Edit Customer</h5>
                  <span>Update existing customer record</span>
                </div>

                <button
                  type="button"
                  className="app-modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="app-modal-body">
                <form className="modal-form">
                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Customer Information
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Customer Name</label>
                        <input
                          type="text"
                          placeholder="Enter customer/company name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="form-control"
                          maxLength={50}
                        />
                        <small className="modal-help-text">
                          {customerName.length}/50
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Contact Person</label>
                        <input
                          type="text"
                          placeholder="Enter contact person name"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="form-control"
                          maxLength={50}
                        />
                        <small className="modal-help-text">
                          {contactPerson.length}/50
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          placeholder="Enter customer city"
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="form-control"
                          maxLength={50}
                        />
                        <small className="modal-help-text">
                          {customerCity.length}/50
                        </small>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Address</label>
                        <textarea
                          placeholder="Enter complete customer address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="form-control"
                          maxLength={150}
                        />
                        <small className="modal-help-text">
                          {customerAddress.length}/150
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Contact & Billing
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Contact Number</label>
                        <input
                          type="text"
                          placeholder="Enter contact number"
                          value={customerContact}
                          onChange={(e) => setCustomerContact(e.target.value)}
                          className="form-control"
                          maxLength={30}
                        />
                        <small className="modal-help-text">
                          {customerContact.length}/30
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Customer TIN</label>
                        <input
                          type="text"
                          placeholder="Enter TIN"
                          value={customerTIN}
                          onChange={(e) => setCustomerTIN(e.target.value)}
                          className="form-control"
                          maxLength={30}
                        />
                        <small className="modal-help-text">
                          {customerTIN.length}/30
                        </small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Payment Terms</label>
                        <input
                          type="text"
                          placeholder="Enter terms"
                          value={customerTerms}
                          onChange={(e) => setCustomerTerms(e.target.value)}
                          className="form-control"
                          maxLength={50}
                        />
                        <small className="modal-help-text">
                          {customerTerms.length}/50
                        </small>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleSubmitEditCustomer}
                  disabled={!customerName || !customerContact || !customerAddress}
                >
                  Update Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default CustomerTable;
