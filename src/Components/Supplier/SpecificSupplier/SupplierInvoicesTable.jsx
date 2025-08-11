import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";


function SupplierInvoicesTable() {
  const location = useLocation();
  const supplier = location.state?.row || {};
  const supplierName = supplier.name || "Supplier";
  const supplierID = supplier?.id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editableSupplier, setEditableSupplier] = useState({
    id: "",
    name: "",
    address: "",
  });

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    supplierInvoiceID: "",
    purchaseDate: "",
    items: [
      {
        itemCode: "",
        quantity: null,
        unit: "",
        unitCost: null,
        discount: null,
      },
    ],
  });

  useEffect(() => {
    if (!supplierID) return;

    axios
      .get(`http://localhost:3000/invoices/${supplierID}`)
      .then((res) => {
        setInvoiceData(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => console.error("Error fetching invoices:", err));
  }, [supplierID]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = invoiceData.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleUpdateSupplier = async () => {
    try {
      await axios.put(
        `http://localhost:3000/suppliers/${editableSupplier.id}`,
        {
          name: editableSupplier.name,
          address: editableSupplier.address,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Supplier Updated",
        text: "Supplier details have been successfully updated.",
        confirmButtonColor: "#0C1D61",
      });

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

  const handleSubmitInvoice = async () => {
    try {
      const payload = {
        supplierInvoiceID: invoiceForm.supplierInvoiceID,
        purchaseDate: invoiceForm.purchaseDate,
        supplierID: supplierID,
        items: invoiceForm.items.map((item) => ({
          ...item,
          grossPrice: item.unitCost * item.quantity - item.discount,
        })),
      };

      console.log("📤 Submitting invoice data:", payload);

      await axios.post("http://localhost:3000/invoices", payload);

      Swal.fire({
        icon: "success",
        title: "Invoice Submitted",
        text: "The supplier invoice has been added successfully!",
        confirmButtonColor: "#0C1D61",
      });

      setShowCreateModal(false);
      setInvoiceForm({
        supplierInvoiceID: "",
        purchaseDate: "",
        items: [
          {
            itemCode: "",
            quantity: null,
            unit: "",
            unitCost: null,
            discount: null,
          },
        ],
      });

      const res = await axios.get(
        `http://localhost:3000/invoices/${supplierID}`
      );
      setInvoiceData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("Error submitting invoice:", err);

      if (err.response && err.response.data && err.response.data.message) {
        Swal.fire({
          icon: "error",
          title: "Invoice Error",
          text: err.response.data.message,
          confirmButtonColor: "#0C1D61",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to submit invoice. Please try again.",
          confirmButtonColor: "#0C1D61",
        });
      }
    }
  };

  const columns = [
    {
      name: "Invoice ID",
      selector: (row) => row.supplierInvoiceID,
      sortable: true,
    },
    { name: "Date", selector: (row) => row.purchaseDate, sortable: true },
    {
      name: "Number of Items",
      selector: (row) => row.items?.length || 0,
      sortable: true,
    },
    {
      name: "Total Gross Price",
      selector: (row) =>
        `₱${row.items.reduce((sum, item) => sum + (item.grossPrice || 0), 0)}`,
      sortable: true,
    },
  ];

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
          <div className="position-relative w-25 my-3">
            <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search invoices"
              value={searchTerm}
              onChange={handleSearch}
              className="form-control ps-5 border-2 rounded-3"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Left: Edit Supplier Button */}
            <button
              className="btn button-edit-supplier"
              onClick={() => {
                setEditableSupplier({ ...supplier });
                setShowEditModal(true);
              }}
            >
              ✏️ Edit Supplier
            </button>

            <button
              className="btn mb-3"
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: "#0C1D61",
                color: "white",
                whiteSpace: "nowrap",
              }}
            >
              + Create Invoice
            </button>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="500px"
            className="custom-data-table"
            onRowClicked={(row) => {
              setSelectedInvoice(row);
              setShowModal(true);
            }}
          />

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
                      className="btn-close btn-close-white"
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
                            placeholder="Supplier ID"
                            value={editableSupplier.id}
                            disabled
                            style={{
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.95rem",
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
                            value={editableSupplier.name}
                            onChange={(e) =>
                              setEditableSupplier({
                                ...editableSupplier,
                                name: e.target.value,
                              })
                            }
                            className="form-control"
                            required
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.95rem",
                              transition: "border-color 0.3s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#0C1D61")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
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
                            value={editableSupplier.address}
                            onChange={(e) =>
                              setEditableSupplier({
                                ...editableSupplier,
                                address: e.target.value,
                              })
                            }
                            className="form-control"
                            rows="3"
                            required
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.95rem",
                              resize: "vertical",
                              transition: "border-color 0.3s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#0C1D61")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
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
                        !editableSupplier.name || !editableSupplier.address
                      }
                      style={{
                        backgroundColor:
                          !editableSupplier.name || !editableSupplier.address
                            ? "#6c757d"
                            : "#0C1D61",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        cursor:
                          !editableSupplier.name || !editableSupplier.address
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (editableSupplier.name && editableSupplier.address) {
                          e.target.style.backgroundColor = "#1e3c72";
                          e.target.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (editableSupplier.name && editableSupplier.address) {
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

          {showCreateModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <div
                className="modal-dialog modal-xl modal-dialog-centered"
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
                        <h5 className="modal-title mb-0">
                          Create New Supplier Invoice
                        </h5>
                        <small className="opacity-75">
                          Generate a new purchase invoice
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowCreateModal(false)}
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
                      {/* Invoice Header Information */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label
                            htmlFor="invoiceNumber"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-file-invoice me-2"
                              style={{ color: "#0C1D61" }}
                            ></i>
                            Invoice Number{" "}
                          </label>
                          <input
                            type="text"
                            id="invoiceNumber"
                            className="form-control"
                            placeholder="Enter invoice number"
                            value={invoiceForm.supplierInvoiceID}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                supplierInvoiceID: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.95rem",
                              transition: "border-color 0.3s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#0C1D61")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label
                            htmlFor="purchaseDate"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-calendar-alt me-2"
                              style={{ color: "#0C1D61" }}
                            ></i>
                            Purchase Date
                          </label>
                          <input
                            type="date"
                            id="purchaseDate"
                            className="form-control"
                            value={invoiceForm.purchaseDate}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                purchaseDate: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.95rem",
                              transition: "border-color 0.3s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#0C1D61")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
                          />
                        </div>
                      </div>

                      {/* Items Section */}
                      <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h6
                            className="mb-0 fw-semibold"
                            style={{ color: "#0C1D61" }}
                          >
                            <i className="fas fa-list me-2"></i>
                            Invoice Items
                          </h6>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() =>
                              setInvoiceForm({
                                ...invoiceForm,
                                items: [
                                  ...invoiceForm.items,
                                  {
                                    itemCode: "",
                                    quantity: null,
                                    unit: "",
                                    unitCost: null,
                                    discount: null,
                                  },
                                ],
                              })
                            }
                            style={{
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "0.375rem",
                              fontWeight: "500",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#218838";
                              e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#28a745";
                              e.target.style.transform = "translateY(0)";
                            }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Add Item
                          </button>
                        </div>

                        {/* Items Table Header */}
                        <div
                          className="row g-2 mb-2 py-2 px-2 rounded-2"
                          style={{
                            backgroundColor: "#f8f9fa",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            color: "#495057",
                          }}
                        >
                          <div className="col-2">Item Code</div>
                          <div className="col-2">Quantity</div>
                          <div className="col-2">Unit</div>
                          <div className="col-2">Unit Cost</div>
                          <div className="col-2">Discount</div>
                          <div className="col-1">Subtotal</div>
                          <div className="col-1">Action</div>
                        </div>

                        {/* Items List */}
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          {invoiceForm.items.map((item, index) => (
                            <div
                              key={index}
                              className="row g-2 mb-2 align-items-center"
                            >
                              <div className="col-2">
                                <input
                                  type="text"
                                  placeholder="Item Code"
                                  className="form-control form-control-sm"
                                  value={item.itemCode}
                                  onChange={(e) => {
                                    const updated = [...invoiceForm.items];
                                    updated[index].itemCode = e.target.value;
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      items: updated,
                                    });
                                  }}
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                  }}
                                />
                              </div>
                              <div className="col-2">
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  className="form-control form-control-sm"
                                  value={item.quantity || ""}
                                  onChange={(e) => {
                                    const updated = [...invoiceForm.items];
                                    updated[index].quantity =
                                      parseInt(e.target.value) || 0;
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      items: updated,
                                    });
                                  }}
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                  }}
                                />
                              </div>
                              <div className="col-2">
                                <input
                                  type="text"
                                  placeholder="Unit"
                                  className="form-control form-control-sm"
                                  value={item.unit}
                                  onChange={(e) => {
                                    const updated = [...invoiceForm.items];
                                    updated[index].unit = e.target.value;
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      items: updated,
                                    });
                                  }}
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                  }}
                                />
                              </div>
                              <div className="col-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Cost"
                                  className="form-control form-control-sm"
                                  value={item.unitCost || ""}
                                  onChange={(e) => {
                                    const updated = [...invoiceForm.items];
                                    updated[index].unitCost =
                                      parseFloat(e.target.value) || 0;
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      items: updated,
                                    });
                                  }}
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                  }}
                                />
                              </div>
                              <div className="col-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Discount"
                                  className="form-control form-control-sm"
                                  value={item.discount || ""}
                                  onChange={(e) => {
                                    const updated = [...invoiceForm.items];
                                    updated[index].discount =
                                      parseFloat(e.target.value) || 0;
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      items: updated,
                                    });
                                  }}
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                  }}
                                />
                              </div>
                              <div className="col-1">
                                <span
                                  className="badge bg-light text-dark fw-normal"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  ₱
                                  {(
                                    (item.quantity || 0) *
                                      (item.unitCost || 0) -
                                    (item.discount || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                              <div className="col-1">
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  onClick={() => {
                                    const updated = invoiceForm.items.filter(
                                      (_, i) => i !== index
                                    );
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      items: updated,
                                    });
                                  }}
                                  
                                >
                                  <FaTrashAlt style={{ color: "#B64345"}} size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total Section */}
                        <div
                          className="border-top pt-3 mt-3"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(12, 29, 97, 0.05) 0%, rgba(30, 60, 114, 0.05) 100%)",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                          }}
                        >
                          <div className="row">
                            <div className="col-md-8"></div>
                            <div className="col-md-4">
                              <div className="d-flex justify-content-between align-items-center">
                                <span
                                  className="fw-semibold"
                                  style={{ color: "#0C1D61" }}
                                >
                                  <i className="fas fa-calculator me-2"></i>
                                  Total Gross Price:
                                </span>
                                <span
                                  className="fw-bold fs-4"
                                  style={{ color: "#0C1D61" }}
                                >
                                  ₱
                                  {invoiceForm.items
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.quantity * item.unitCost -
                                          (item.discount || 0))
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </span>
                              </div>
                            </div>
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
                          Make sure to add at least one item before submitting
                          the invoice.
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer bg-light border-0 rounded-bottom">
                    <button
                      type="button"
                      className="btn px-4 py-2 me-2"
                      onClick={() => setShowCreateModal(false)}
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
                      onClick={handleSubmitInvoice}
                      disabled={
                        !invoiceForm.supplierInvoiceID ||
                        !invoiceForm.purchaseDate ||
                        invoiceForm.items.length === 0
                      }
                      style={{
                        backgroundColor:
                          !invoiceForm.supplierInvoiceID ||
                          !invoiceForm.purchaseDate ||
                          invoiceForm.items.length === 0
                            ? "#6c757d"
                            : "#0C1D61",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        cursor:
                          !invoiceForm.supplierInvoiceID ||
                          !invoiceForm.purchaseDate ||
                          invoiceForm.items.length === 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          invoiceForm.supplierInvoiceID &&
                          invoiceForm.purchaseDate &&
                          invoiceForm.items.length > 0
                        ) {
                          e.target.style.backgroundColor = "#1e3c72";
                          e.target.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (
                          invoiceForm.supplierInvoiceID &&
                          invoiceForm.purchaseDate &&
                          invoiceForm.items.length > 0
                        ) {
                          e.target.style.backgroundColor = "#0C1D61";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Submit Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showModal && selectedInvoice && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header d-flex flex-column align-items-start">
                    <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                      <p
                        className="mb-2"
                        style={{ color: "#05050599", fontSize: "12px" }}
                      >
                        Supplier &gt; Invoices &gt;{" "}
                        {selectedInvoice.supplierInvoiceID}
                      </p>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>
                    <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                        Invoice ID: {selectedInvoice.supplierInvoiceID}
                      </h5>
                    </div>
                  </div>

                  <div className="modal-body">
                    <div
                      className="rounded-3"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      <ul className="list-unstyled">
                        {selectedInvoice.items.map((item, index) => (
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
                                  <span className="fw-semibold">
                                    {item.itemCode}
                                  </span>
                                  <small className="text-muted">
                                    Qty: {item.quantity} {item.unit}
                                  </small>
                                </div>
                              </div>

                              <div className="text-end d-flex flex-column">
                                <span className="fw-semibold">
                                  ₱
                                  {item.grossPrice.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                                <small className="text-muted">
                                  Unit: ₱{item.unitCost} | Disc: ₱
                                  {item.discount}
                                </small>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                      <span className="h5 fw-semibold">Gross Total</span>
                      <span className="fw-bold h5">
                        ₱
                        {selectedInvoice.items
                          .reduce((sum, item) => sum + item.grossPrice, 0)
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                      </span>
                    </div>
                  </div>

                  <div className="modal-footer d-flex justify-content-between align-items-end px-3">
                    <div>
                      <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>
                        {supplierName}
                      </p>
                      <p className="mb-0 small">
                        Supplier ID: {selectedInvoice.supplierID}
                      </p>
                    </div>
                    <p className="text-muted small mb-0">
                      {new Date(
                        selectedInvoice.purchaseDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredData.length === 0 && (
            <p className="text-center text-muted">
              No invoices found for this supplier.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierInvoicesTable;
