import DataTable from "react-data-table-component";
import { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { usePagination } from "../../../hooks/usePagination";
import SuggestionList from "./SuggestionList";

function SupplierInvoicesTable({ allItems }) {
  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination(1, 50);
  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } =
    useDraggableModal();
  const location = useLocation();
  const supplier = location.state?.row || {};
  const supplierName = supplier.name || "Supplier";
  const supplierID = supplier?.id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [products, setProducts] = useState({});

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    poNum: "",
    invoiceID: "",
    purchaseDate: "",
    invoiceType: "Purchased",
    items: [
      {
        itemID: null,
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

  const [queries, setQueries] = useState({});
  const [suggestions, setSuggestions] = useState({});

  const handleSearchChange = async (index, value) => {
    setQueries((prev) => ({ ...prev, [index]: value }));
    console.log(index, value);

    if (value.length > 0) {
      try {
        const res = await axios.get(`${API_URL}/product/search`, {
          params: {
            q: value,
            limit: 20,
          },
        });

        const filtered = res.data.map((item) => ({
          ...item,
          itemName: item.item_name,
          itemCode: item.item_code,
        }));

        console.log("Filtered suggestions:", filtered);
        setSuggestions((prev) => ({ ...prev, [index]: filtered }));
      } catch (err) {
        console.error("Search failed:", err);
        setSuggestions((prev) => ({ ...prev, [index]: [] }));
      }
    } else {
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleSelectSuggestion = (index, suggestion) => {
    // Check if this itemID already exists in the invoiceForm items (excluding current index)
    console.log("Selected itemName:", suggestion.itemName);
    console.log("Selected itemID:", suggestion.id);

    const isDuplicate = invoiceForm.items.some(
      (item, i) => i !== index && item.itemID === suggestion.itemID,
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "warning",
        iconColor: "#1E5A84",
        title: "Duplicate Product",
        text: `"${suggestion.itemName}" is already in the order list.`,
        confirmButtonColor: "#1E5A84",
      });
      setSuggestions("");
      return; // Exit early, do not update
    }

    const updated = [...invoiceForm.items];
    updated[index] = {
      ...updated[index],
      itemName: suggestion.itemName,
      itemCode: suggestion.itemCode,
      itemID: suggestion.id,
      unit: suggestion.unit || "pc",
    };

    setInvoiceForm((prev) => ({
      ...prev,
      items: updated,
    }));

    // Update input field display and hide suggestion list
    setQueries((prev) => ({ ...prev, [index]: suggestion.itemName }));
    setSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/supplier-invoice`, {
        params: { supplier: supplierID, page, limit },
      });

      const { data, meta } = res.data;
      setInvoiceData(data);
      setFilteredData(data);
      setTotalRows(meta.total);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  useEffect(() => {
    if (!supplierID) return;
    fetchInvoices();
  }, [supplierID, page, limit]);

  useEffect(() => {
    if (!selectedInvoice) return;

    const fetchProducts = async () => {
      const items = selectedInvoice.supplier_invoice_items;
      const productData = {};

      for (const item of items) {
        try {
          const res = await axios.get(`${API_URL}/product/${item.product_id}`);
          productData[item.product_id] = res.data;
        } catch (err) {
          console.error("Failed to fetch product:", item.product_id, err);
        }
      }

      setProducts(productData);
    };

    fetchProducts();
  }, [selectedInvoice]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = invoiceData.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value),
      ),
    );

    setFilteredData(filtered);
  };

  const handleSubmitInvoice = async () => {
    try {
      const payload = {
        invoice_number: invoiceForm.invoiceID,
        po_number: invoiceForm.poNum,
        purchase_date: invoiceForm.purchaseDate,
        supplier_id: supplierID,
        conversion_factor: Number(invoiceForm.conversionFactor) || 1,

        items: invoiceForm.items.map((item) => ({
          product_id: item.itemID,
          quantity: Number(item.quantity),
          unit_cost: Number(item.unitCost),
        })),
      };

      console.log("📤 Submitting invoice data:", payload);

      Swal.fire({
        title: "Submitting Invoice",
        text: "Please wait while we process your invoice...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(`${API_URL}/supplier-invoice`, payload);

      Swal.fire({
        icon: "success",
        title: "Invoice Submitted",
        text: "The supplier invoice has been added successfully!",
        confirmButtonColor: "#1E5A84",
      });

      // Reset form
      setInvoiceForm({
        poNum: "",
        invoiceID: "",
        purchaseDate: "",
        conversionFactor: 1,
        items: [
          {
            productId: null,
            quantity: null,
            unitCost: null,
          },
        ],
      });

      setQueries({});
      setSuggestions({});
      setShowCreateModal(false);

      const res = await axios.get(
        `${API_URL}/supplier-invoice?supplier=${supplierID}`,
      );
      setInvoiceData(res.data.data);
      setFilteredData(res.data.data);
    } catch (err) {
      console.error("Error submitting invoice:", err);

      Swal.fire({
        icon: "error",
        title: "Invoice Error",
        text:
          err?.response?.data?.message ||
          "Failed to submit invoice. Please try again.",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handlePostInvoice = async () => {
    if (!selectedInvoice?.id) return;

    const result = await Swal.fire({
      icon: "warning",
      iconColor: "#1E5A84",
      title: "Post Invoice?",
      text: `Are you sure you want to post ${selectedInvoice.invoice_number}? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, Post",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1E5A84",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    // 🔄 Loading Swal
    Swal.fire({
      title: "Posting Invoice",
      text: "Please wait while we post the invoice...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.patch(
        `${API_URL}/supplier-invoice/${selectedInvoice.id}/post`,
      );

      // Update UI state
      setSelectedInvoice((prev) => ({
        ...prev,
        status: "POSTED",
      }));

      Swal.fire({
        icon: "success",
        iconColor: "#1E5A84",
        title: "Invoice Posted",
        text: `${selectedInvoice.invoice_number} has been successfully posted.`,
        confirmButtonColor: "#1E5A84",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error posting invoice:", error);

      Swal.fire({
        icon: "error",
        iconColor: "#dc3545",
        title: "Posting Failed",
        text:
          error.response?.data?.message ||
          "Failed to post invoice. Please try again.",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handleEditModal = (selectedInvoice) => {
    console.log("Selected Invoice for Editing:", selectedInvoice);
    setInvoiceForm({
      invoice_number: selectedInvoice.invoice_number,
      po_number: selectedInvoice.po_number,
      purchase_date: selectedInvoice.purchase_date,
      supplier_id: selectedInvoice.supplier_id,
      conversion_factor: selectedInvoice.conversion_factor ?? 1,
      items: selectedInvoice.supplier_invoice_items.map((item) => ({
        product_id: item.products.id,
        itemName: item.products?.item_name || "",
        unit: item.products?.unit || "",
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      })),
    });

    console.log("Editing Invoice Form Data:", invoiceForm);

    // Pre-fill queries so autocomplete input shows existing names
    setQueries(
      Object.fromEntries(
        selectedInvoice.supplier_invoice_items.map((item, index) => [
          index,
          item.products?.item_name || "",
        ]),
      ),
    );

    setShowEditModal(true);
  };

  const handleUpdateInvoice = async () => {
    const payload = {
      invoice_number: invoiceForm.invoice_number,
      po_number: invoiceForm.po_number,
      purchase_date: invoiceForm.purchase_date,
      supplier_id: invoiceForm.supplier_id,
      conversion_factor: invoiceForm.conversion_factor,
      items: invoiceForm.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      })),
    };

    // 🟡 Confirm first
    const result = await Swal.fire({
      title: "Update Invoice?",
      text: "Are you sure you want to save these changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      console.log("📤 Updating invoice with payload:", payload);
      // 🔄 Loading state
      Swal.fire({
        title: "Updating...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.put(
        `${API_URL}/supplier-invoice/${selectedInvoice.id}`,
        payload,
      );

       await fetchInvoices();

      // ✅ Success
      await Swal.fire({
        title: "Updated!",
        text: "Invoice has been updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowEditModal(false);
      setShowModal(false);
    } catch (error) {
      console.error(error);

      // ❌ Error
      Swal.fire({
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while updating the invoice.",
        icon: "error",
      });
    }
  };

  const handleEditSearchChange = (index, value) => {
    setQueries((prev) => ({ ...prev, [index]: value }));

    // clear existing product binding
    setInvoiceForm((prev) => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        itemName: value,
        unit: "",
      };
      return { ...prev, items: updated };
    });

    // reuse your existing search logic
    handleSearchChange(index, value);
  };

  const handleEditSelectSuggestion = (index, suggestion) => {
    setInvoiceForm((prev) => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        product_id: suggestion.id,
        itemName: suggestion.item_name,
        unit: suggestion.unit,
      };
      return { ...prev, items: updated };
    });

    setQueries((prev) => ({
      ...prev,
      [index]: suggestion.item_name,
    }));

    setSuggestions((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const statusColors = {
    pending: {
      bg: "#ffc107", // amber
      text: "#000",
    },
    posted: {
      bg: "#198754", // deep green
      text: "#fff",
    },
  };

  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      width: "200px",
    },
    {
      name: "Invoice No.",
      selector: (row) => row.invoice_number,
      width: "200px",
    },
    {
      name: "PO No.",
      selector: (row) => row.po_number,
      width: "200px",
    },
    {
      name: "Purchase Date",
      selector: (row) => row.purchase_date || row.purchaseDate,
      width: "200px",
    },
    {
      name: "Item Count",
      selector: (row) => row.supplier_invoice_items?.length ?? 0,
      width: "200px",
    },
    {
      name: "Total Price",
      selector: (row) => {
        const items = row.supplier_invoice_items ?? [];

        const total = items.reduce(
          (sum, item) => sum + Number(item.subtotal || item.subTotal || 0),
          0,
        );

        return total.toLocaleString("en-PH", {
          style: "currency",
          currency: row.currency || "PHP",
          minimumFractionDigits: 2,
        });
      },
      width: "300px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "200px",
      cell: (row) => {
        const statusKey = row.status?.trim().toLowerCase();

        const statusStyle = statusColors[statusKey] || {
          bg: "#6c757d",
          text: "#fff",
        };

        return (
          <span
            className="badge px-3 py-2 fw-semibold text-uppercase"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              borderRadius: "20px",
              letterSpacing: "0.5px",
            }}
          >
            {row.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <p
          className="h1 fw-bold mb-0 ms-3"
          style={{ color: "#1E5A84", fontFamily: "'Outfit', sans-serif" }}
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
                  backgroundColor: "#1E5A84",
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
            paginationServer
            paginationTotalRows={totalRows}
            paginationRowsPerPageOptions={[50, 100, 150, 200]}
            paginationPerPage={50}
            onChangePage={(newPage) => setPage(newPage)}
            onChangeRowsPerPage={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="700px"
            className="custom-data-table"
            onRowClicked={(row) => {
              console.log("Selected Invoice:", row);
              setSelectedInvoice(row);
              setShowModal(true);
            }}
          />

          {showCreateModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <div
                className="modal-dialog modal-xl modal-dialog-centered"
                role="document"
              >
                <div className="modal-content shadow-lg border-0">
                  {/* Header with gradient background */}
                  <div
                    className="modal-header text-white position-relative overflow-hidden cursor-move"
                    style={{
                      background:
                        "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                      borderRadius: "0.5rem 0.5rem 0 0",
                      userSelect: "none",
                    }}
                    onMouseDown={handleHeaderMouseDown}
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
                              style={{ color: "#1E5A84" }}
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
                              (e.target.style.borderColor = "#1E5A84")
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
                              style={{ color: "#1E5A84" }}
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
                              (e.target.style.borderColor = "#1E5A84")
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
                              style={{ color: "#1E5A84" }}
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
                              (e.target.style.borderColor = "#1E5A84")
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
                              style={{ color: "#1E5A84" }}
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
                              (e.target.style.borderColor = "#1E5A84")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e9ecef")
                            }
                          >
                            <option value="Purchased">Purchased</option>
                            <option value="Returned" disabled>
                              Returned (Unavailable)
                            </option>
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label
                            htmlFor="currency"
                            className="form-label fw-semibold text-muted small"
                          >
                            <i
                              className="fas fa-dollar-sign me-2"
                              style={{ color: "#1E5A84" }}
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
                              (e.target.style.borderColor = "#1E5A84")
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
                              style={{ color: "#1E5A84" }}
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
                              (e.target.style.borderColor = "#1E5A84")
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
                            style={{ color: "#1E5A84" }}
                          >
                            <i className="fas fa-list me-2"></i>
                            Invoice Items
                          </h6>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
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
                              });
                            }}
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
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.unit ?? ""}
                                  readOnly
                                  onChange={(e) => {
                                    const updated = [...invoiceForm.items];
                                    updated[index] = {
                                      ...updated[index],
                                      unit: e.target.value,
                                    };
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
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <div className="col-1">
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  style={{ color: "#B64345" }}
                                  onClick={() => {
                                    const updated = invoiceForm.items.filter(
                                      (_, i) => i !== index,
                                    );
                                    setInvoiceForm((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));

                                    // 🧹 Also clear related query/suggestion for that index
                                    setQueries((prev) => {
                                      const newQueries = { ...prev };
                                      delete newQueries[index];
                                      return newQueries;
                                    });

                                    setSuggestions((prev) => {
                                      const newSuggestions = { ...prev };
                                      delete newSuggestions[index];
                                      return newSuggestions;
                                    });
                                  }}
                                >
                                  <FaTrashAlt size={16} />
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
                                  style={{ color: "#1E5A84" }}
                                >
                                  <i className="fas fa-calculator me-2"></i>
                                  Total Price:
                                </span>
                                <span
                                  className="fw-bold fs-4"
                                  style={{ color: "#1E5A84" }}
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
                                    .toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
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
                            : "#1E5A84",
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
                          e.target.style.backgroundColor = "#1E5A84";
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
                          "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                        borderRadius: "0.5rem 0.5rem 0 0",
                      }}
                    >
                      {/* Breadcrumb */}
                      <div className="w-100">
                        <p
                          className="mb-2 opacity-75"
                          style={{ fontSize: "12px" }}
                        >
                          Supplier &gt; Invoices &gt;{" "}
                          {selectedInvoice.po_number}
                        </p>
                      </div>

                      {/* Title + Buttons Row */}
                      <div className="w-100 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          Invoice ID: {selectedInvoice.invoice_number}
                        </h5>

                        <div className="d-flex align-items-center gap-2">
                          {selectedInvoice.status !== "POSTED" && (
                            <>
                              <button
                                className="btn btn-sm btn-light fw-semibold"
                                style={{ width: "100px" }}
                                onClick={handlePostInvoice}
                              >
                                POST
                              </button>
                              <button
                                className="btn btn-sm btn-light fw-semibold"
                                style={{ width: "100px" }}
                                onClick={() => handleEditModal(selectedInvoice)}
                              >
                                EDIT
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={() => setShowModal(false)}
                            aria-label="Close"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                      <h6 className="mb-3">Invoice Items</h6>

                      {/* Scrollable Items Container */}
                      <div
                        className="rounded-3"
                        style={{
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        <ul className="list-unstyled">
                          {selectedInvoice.supplier_invoice_items.map(
                            (item, index) => {
                              const product = item.products; // get fetched product
                              return (
                                <>
                                  <li>
                                    <div className="d-flex justify-content-between align-items-start p-3 rounded">
                                      {/* Item Info */}
                                      <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex flex-column">
                                          <span className="fw-semibold">
                                            {product
                                              ? product.item_name
                                              : "Loading..."}
                                          </span>
                                          <div className="d-flex align-items-center gap-3">
                                            <small className="text-muted">
                                              Quantity: {item.quantity}
                                            </small>
                                            <small className="text-muted">
                                              Unit Cost: ₱{" "}
                                              {item.unit_cost.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 },
                                              )}{" "}
                                              / {product ? product.unit : ""}
                                            </small>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Price Info */}
                                      <div className="d-flex flex-column align-items-end">
                                        <span className="fw-semibold">
                                          ₱
                                          {item.subtotal.toLocaleString(
                                            undefined,
                                            {
                                              minimumFractionDigits: 2,
                                            },
                                          )}
                                        </span>
                                        <span
                                          className={`badge ${
                                            selectedInvoice.status ===
                                            "Purchased"
                                              ? "bg-success"
                                              : selectedInvoice.status ===
                                                  "Returned"
                                                ? "bg-danger"
                                                : "bg-secondary"
                                          }`}
                                        >
                                          {selectedInvoice.status}
                                        </span>
                                      </div>
                                    </div>
                                  </li>
                                </>
                              );
                            },
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between align-items-center bg-light border-top">
                      <div className="text-start">
                        <p className="text-muted small mb-0">Purchase Date</p>
                        <p
                          className="fw-semibold mb-0"
                          style={{ color: "#1E5A84" }}
                        >
                          {new Date(
                            selectedInvoice.purchase_date,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Total Row */}
                      <div className="d-flex align-items-center gap-3">
                        <span className="h5 fw-semibold mb-0">
                          Total Price:
                        </span>
                        <span className="fw-bold h5 mb-0">
                          ₱
                          {selectedInvoice.supplier_invoice_items
                            .reduce((sum, item) => sum + item.subtotal, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {showEditModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                  {/* Header */}
                  <div
                    className="modal-header text-white cursor-move"
                    style={{
                      background:
                        "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                      userSelect: "none",
                    }}
                    onMouseDown={handleHeaderMouseDown}
                  >
                    <h5 className="mb-0">
                      Edit Supplier Invoice — {invoiceForm.invoice_number}
                    </h5>

                    <button
                      className="btn-close btn-close-white"
                      onClick={() => setShowEditModal(false)}
                    />
                  </div>

                  {/* Body */}
                  <div className="modal-body p-4">
                    <form>
                      {/* Header Info */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-3">
                          <label className="form-label small fw-semibold">
                            PO Number
                          </label>
                          <input
                            className="form-control"
                            value={invoiceForm.po_number}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                po_number: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small fw-semibold">
                            Invoice #
                          </label>
                          <input
                            className="form-control"
                            value={invoiceForm.invoice_number}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                invoice_number: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small fw-semibold">
                            Purchase Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={invoiceForm.purchase_date}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                purchase_date: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small fw-semibold">
                            Conversion Factor
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={invoiceForm.conversion_factor}
                            onChange={(e) =>
                              setInvoiceForm({
                                ...invoiceForm,
                                conversion_factor: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Items Section */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between mb-3">
                          <h6 className="fw-semibold text-primary">
                            Invoice Items
                          </h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              setInvoiceForm((prev) => ({
                                ...prev,
                                items: [
                                  ...prev.items,
                                  {
                                    product_id: null,
                                    itemName: "",
                                    unit: "",
                                    quantity: 0,
                                    unit_cost: 0,
                                  },
                                ],
                              }))
                            }
                          >
                            + Add Item
                          </button>
                        </div>

                        {invoiceForm.items.map((item, index) => (
                          <div
                            key={index}
                            className="row g-2 mb-2 align-items-center"
                          >
                            <div className="position-relative col-4">
                              <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Item Name"
                                value={queries[index] ?? item.itemName ?? ""}
                                onChange={(e) =>
                                  handleEditSearchChange(index, e.target.value)
                                }
                              />

                              <SuggestionList
                                anchorRef={{
                                  current: inputRefs.current[index],
                                }}
                                suggestions={suggestions[index]}
                                onSelect={(s) =>
                                  handleEditSelectSuggestion(index, s)
                                }
                              />
                            </div>

                            <div className="col-2">
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = [...invoiceForm.items];
                                  updated[index].quantity = Number(
                                    e.target.value,
                                  );
                                  setInvoiceForm({
                                    ...invoiceForm,
                                    items: updated,
                                  });
                                }}
                              />
                            </div>

                            <div className="col-2">
                              <input
                                className="form-control form-control-sm"
                                value={item.unit || ""}
                                readOnly
                              />
                            </div>

                            <div className="col-2">
                              <input
                                type="number"
                                step="0.01"
                                className="form-control form-control-sm"
                                value={item.unit_cost}
                                onChange={(e) => {
                                  const updated = [...invoiceForm.items];
                                  updated[index].unit_cost = Number(
                                    e.target.value,
                                  );
                                  setInvoiceForm({
                                    ...invoiceForm,
                                    items: updated,
                                  });
                                }}
                              />
                            </div>

                            <div className="col-1 fw-semibold">
                              ₱
                              {(
                                item.quantity *
                                item.unit_cost *
                                invoiceForm.conversion_factor
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </div>

                            <div className="col-1">
                              <button
                                className="btn btn-sm text-danger"
                                onClick={() =>
                                  setInvoiceForm((prev) => ({
                                    ...prev,
                                    items: prev.items.filter(
                                      (_, i) => i !== index,
                                    ),
                                  }))
                                }
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer bg-light">
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateInvoice}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierInvoicesTable;
