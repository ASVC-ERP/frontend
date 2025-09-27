import DataTable from "react-data-table-component";
import { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";

import SuggestionList from "./SuggestionList";

function SupplierInvoicesTable({ items }) {
  const location = useLocation();
  const supplier = location.state?.row || {};
  const supplierName = supplier.name || "Supplier";
  const supplierID = supplier?.id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    poNum: "",
    invoiceID: "",
    purchaseDate: "",
    invoiceType: "Purchased",
    items: [
      {
        itemCode: "",
        quantity: null,
        unit: "",
        unitCost: null,
        currency: "",
        conversionFactor: null,
        subTotal: null,
      },
    ],
  });

  const inputRefs = useRef([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const [queries, setQueries] = useState({}); // per item input text
  const [suggestions, setSuggestions] = useState({}); // per item suggestions

  const handleSearchChange = (index, value) => {
    setQueries((prev) => ({ ...prev, [index]: value }));

    if (value.length > 0) {
      const filtered = items.filter(
        (p) =>
          p.itemName.toLowerCase().includes(value.toLowerCase()) ||
          p.itemCode.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions((prev) => ({ ...prev, [index]: filtered }));
      console.log("Filtered suggestions:", filtered);
    } else {
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleSelectSuggestion = (index, suggestion) => {
    const updated = [...invoiceForm.items];
    updated[index] = {
      ...updated[index], // create new object
      itemName: suggestion.itemName,
      itemCode: suggestion.itemCode,
    };
    setInvoiceForm({ ...invoiceForm, items: updated });

    setQueries((prev) => ({ ...prev, [index]: suggestion.itemName }));
    setSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  useEffect(() => {
    if (!supplierID) return;

    axios
      .get(`${API_URL}/suppliers/supplier-invoices/${supplierID}`)
      .then((res) => {
        setInvoiceData(res.data);
        setFilteredData(res.data);
        console.log("📥 Fetched invoices:", res.data);
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

  const handleSubmitInvoice = async () => {
    try {
      const payload = {
        poNum: invoiceForm.poNum,
        invoiceID: invoiceForm.invoiceID,
        purchaseDate: invoiceForm.purchaseDate,
        supplierID: supplierID,
        status: invoiceForm.invoiceType,
        items: invoiceForm.items.map((item) => ({
          itemName: item.itemName, // explicitly pass both
          itemCode: item.itemCode,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          currency: item.currency,
          conversionFactor: item.conversionFactor,
          subTotal:
            item.unitCost * item.quantity * (item.conversionFactor || 1),
        })),
      };

      console.log("📤 Submitting invoice data:", payload);

      // Show loading Swal
      Swal.fire({
        title: "Submitting Invoice",
        text: "Please wait while we process your invoice...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(`${API_URL}/suppliers/supplier-invoices`, payload);

      Swal.fire({
        icon: "success",
        title: "Invoice Submitted",
        text: "The supplier invoice has been added successfully!",
        confirmButtonColor: "#0C1D61",
      });

      setInvoiceForm({
        poNum: "",
        invoiceID: "",
        purchaseDate: "",
        invoiceType: "Purchased",
        items: [
          {
            itemName: "",
            quantity: null,
            unit: "",
            unitCost: null,
            currency: "",
            conversionFactor: null,
          },
        ],
      });
      setQueries({});
      setSuggestions({});

      setShowCreateModal(false);

      const res = await axios.get(
        `${API_URL}/suppliers/supplier-invoices/${supplierID}`
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
      selector: (row) => row.invoiceID,
      sortable: true,
    },
    { name: "Date", selector: (row) => row.purchaseDate, sortable: true },
    {
      name: "Number of Items",
      selector: (row) => row.items?.length || 0,
      sortable: true,
    },
    {
      name: "Total Price",
      selector: (row) => {
        const total = row.items.reduce(
          (sum, item) => sum + (item.subTotal || 0),
          0
        );
        return `₱${total.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
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
          <div className="d-flex justify-content-between align-items-center mt-2">
            {/* Search Box */}
            <div className="position-relative w-25">
              <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                placeholder="Search invoices"
                value={searchTerm}
                onChange={handleSearch}
                className="form-control ps-5 border-2 rounded-3"
              />
            </div>

            {/* Add Invoice Button */}
            <div>
              <button
                className="btn"
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: "#0C1D61",
                  color: "white",
                  whiteSpace: "nowrap",
                }}
              >
                + Add Invoice
              </button>
            </div>
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
                          Add Supplier Invoice
                        </h5>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
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
                        {/* Purchase Order Number */}
                        <div className="col-md-2">
                          <label
                            htmlFor="poNum"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-file-invoice me-2"
                              style={{ color: "#0C1D61" }}
                            ></i>
                            Purchase Order Number{" "}
                          </label>
                          <input
                            type="text"
                            id="poNum"
                            className="form-control"
                            placeholder="Enter PO number"
                            value={invoiceForm.poNum}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                poNum: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.90rem",
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

                        {/* Invoice ID */}
                        <div className="col-md-2">
                          <label
                            htmlFor="invoiceID"
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
                            id="invoiceID"
                            className="form-control"
                            placeholder="Enter invoice number"
                            value={invoiceForm.invoiceID}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                invoiceID: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.90rem",
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

                        {/* Purchase Date */}
                        <div className="col-md-2">
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
                              fontSize: "0.90rem",
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

                        <div className="col-md-2">
                          <label
                            htmlFor="invoiceType"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-exchange-alt me-2"
                              style={{ color: "#0C1D61" }}
                            ></i>
                            Type
                          </label>
                          <select
                            id="invoiceType"
                            className="form-select"
                            value={invoiceForm.invoiceType}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                invoiceType: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.90rem",
                              transition: "border-color 0.3s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#0C1D61")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
                          >
                            <option value="Purchased">Purchased</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label
                            htmlFor="currency"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-dollar-sign me-2"
                              style={{ color: "#0C1D61" }}
                            ></i>
                            Currency
                          </label>
                          <input
                            type="text"
                            id="currency"
                            className="form-control"
                            value={supplier.currency}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                currency: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.90rem",
                              transition: "border-color 0.3s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#0C1D61")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
                            readOnly
                          />
                        </div>

                        <div className="col-md-2">
                          <label
                            htmlFor="conversionFactor"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-dollar-sign me-2"
                              style={{ color: "#0C1D61" }}
                            ></i>
                            Conversion Factor
                          </label>
                          <input
                            type="text"
                            id="conversionFactor"
                            className="form-control"
                            value={invoiceForm.conversionFactor}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                conversionFactor: e.target.value,
                              })
                            }
                            style={{
                              border: "1px solid #e9ecef",
                              borderRadius: "0.5rem",
                              fontSize: "0.90rem",
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
                                    subTotal: null,
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
                          className="row gap-4 mb-2 py-2 px-2 rounded-2 justify-content-center"
                          style={{
                            backgroundColor: "#f8f9fa",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            color: "#495057",
                          }}
                        >
                          <div className="col-4">Item Name</div>
                          <div className="col-1">Quantity</div>
                          <div className="col-2">Unit</div>
                          <div className="col-1">Unit Cost</div>
                          <div className="col-1">Subtotal</div>
                          <div className="col-1">Action</div>
                        </div>

                        {/* Items List */}
                        <div
                          style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
                        >
                          {invoiceForm.items.map((item, index) => (
                            <div
                              key={index}
                              className="row g-2 mb-2 gap-4 justify-content-center align-items-center"
                            >
                              <div className="position-relative col-4">
                                <input
                                  ref={(el) => (inputRefs.current[index] = el)} // ✅ this line
                                  type="text"
                                  placeholder="Item Name"
                                  className="form-control form-control-sm"
                                  value={queries[index] ?? item.itemName ?? ""}
                                  onChange={(e) =>
                                    handleSearchChange(index, e.target.value)
                                  }
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                  }}
                                />

                                <SuggestionList
                                  anchorRef={{
                                    current: inputRefs.current[index],
                                  }}
                                  suggestions={suggestions[index]}
                                  onSelect={(s) =>
                                    handleSelectSuggestion(index, s)
                                  }
                                />
                              </div>

                              <div className="col-1">
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
                                <select
                                  className="form-select form-select-sm"
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
                                >
                                  <option value="Pc">Pc</option>
                                  <option value="Pcs">Pcs</option>
                                  <option value="Set">Set</option>
                                  <option value="Bundle">Bundle</option>
                                  <option value="Roll">Roll</option>
                                </select>
                              </div>
                              <div className="col-1">
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
                              <div className="col-1">
                                <span
                                  className="badge bg-light text-dark fw-normal"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  ₱
                                  {(
                                    (item.quantity || 0) *
                                    (item.unitCost || 0) *
                                    (invoiceForm.conversionFactor || 1)
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
                                  <FaTrashAlt
                                    style={{ color: "#B64345" }}
                                    size={18}
                                  />
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
                                  Total Price:
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
                                        item.quantity *
                                          item.unitCost *
                                          (invoiceForm.conversionFactor || 1)
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

                    {/* Additional info card
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
                    */}
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
                        !invoiceForm.poNum ||
                        !invoiceForm.purchaseDate ||
                        invoiceForm.items.length === 0
                      }
                      style={{
                        backgroundColor:
                          !invoiceForm.poNum ||
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
                          !invoiceForm.poNum ||
                          !invoiceForm.purchaseDate ||
                          invoiceForm.items.length === 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          invoiceForm.poNum &&
                          invoiceForm.purchaseDate &&
                          invoiceForm.items.length > 0
                        ) {
                          e.target.style.backgroundColor = "#1e3c72";
                          e.target.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (
                          invoiceForm.poNum &&
                          invoiceForm.purchaseDate &&
                          invoiceForm.items.length > 0
                        ) {
                          e.target.style.backgroundColor = "#0C1D61";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showModal && selectedInvoice && (
            <>
              {/* Backdrop */}
              <div className="modal-backdrop fade show"></div>

              <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
              >
                <div
                  className="modal-dialog modal-lg modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    {/* Header */}
                    <div
                      className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
                        borderRadius: "0.5rem 0.5rem 0 0",
                      }}
                    >
                      <div className="w-100 d-flex justify-content-between align-items-center">
                        <p
                          className="mb-2 opacity-75"
                          style={{ fontSize: "12px" }}
                        >
                          Supplier &gt; Invoices &gt; {selectedInvoice.poNum}
                        </p>
                        <button
                          type="button"
                          className="btn-close btn-close-white p-4"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </div>

                      <div className="w-100 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          Invoice ID: {selectedInvoice.invoiceID}
                        </h5>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                      <h6 className="mb-3">Invoice Items</h6>

                      {/* Scrollable Items Container */}
                      <div
                        className="rounded-3"
                        style={{
                          maxHeight: "250px",
                          overflowY: "auto",
                        }}
                      >
                        <ul className="list-unstyled">
                          {selectedInvoice.items.map((item, index) => (
                            <>
                              <li key={index}>
                                <div className="d-flex justify-content-between align-items-start p-3 rounded">
                                  {/* Item Info */}
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex flex-column">
                                      <span className="fw-semibold">
                                        {item.itemName}
                                      </span>
                                      <small className="text-muted">
                                        Qty: {item.quantity} {item.unit}
                                      </small>
                                      <span
                                        style={{ width: "fit-content" }}
                                        className={`badge ${
                                          selectedInvoice.status === "Purchased"
                                            ? "bg-success"
                                            : selectedInvoice.status ===
                                              "Returned"
                                            ? "bg-danger"
                                            : "bg-secondary"
                                        } mt-2`}
                                      >
                                        {selectedInvoice.status || "N/A"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Price Info */}
                                  <div className="text-end d-flex flex-column">
                                    <span className="fw-semibold">
                                      ₱
                                      {item.subTotal.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>
                                    <small className="text-muted">
                                      Unit: ₱{item.unitCost}
                                    </small>
                                  </div>
                                </div>
                              </li>
                              <hr className="my-0 border-secondary" />
                            </>
                          ))}
                        </ul>
                      </div>

                      {/* Total Row */}
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                        <span className="h5 fw-semibold">Total Price</span>
                        <span className="fw-bold h5">
                          ₱
                          {selectedInvoice.items
                            .reduce((sum, item) => sum + item.subTotal, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between align-items-center bg-light">
                      <div>
                        <p
                          className="fw-bold mb-1"
                          style={{ color: "#0C1D61" }}
                        >
                          {supplierName}
                        </p>
                        <p className="mb-0 small text-muted">
                          Supplier ID: {supplierID}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-muted small mb-0">Purchase Date</p>
                        <p
                          className="fw-semibold mb-0"
                          style={{ color: "#0C1D61" }}
                        >
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
              </div>
            </>
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
