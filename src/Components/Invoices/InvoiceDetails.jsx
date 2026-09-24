import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import EditSalesInvoiceModal from "./EditInvoice";
import "../Purchases/PurchaseDetails.css";
import "../../styles/modal.css";
import "../../styles/details-page.css";
import "../../styles/buttons.css";
import {
  showErrorSwal,
  showWarningSwal,
  showSuccessSwal,
  showLoadingSwal,
  showConfirmSwal,
} from "../../utils/swal";
import SalesInvoiceReturnModal from "./ReturnInvoice";
import { debug } from "../../utils/log";

const API_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

export default function SalesInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDotMatrixModal, setShowDotMatrixModal] = useState(false);
  const [dotMatrixMode, setDotMatrixMode] = useState("form");
  const [printerName, setPrinterName] = useState(
    () => localStorage.getItem("dotMatrixPrinterName") || ""
  );

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoice/${id}`);
      debug(res.data);
      setInvoice(res.data);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = async (url) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });
  
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
  
      const blobUrl = window.URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank");
  
      if (!newWindow) {
        showWarningSwal("Popup Blocked","Please allow popups to view the PDF.")
      }
  
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
  
      showErrorSwal("Print Failed","Failed to generate PDF. See console for details.");
    }
  };
  
  const handlePrintPackingList = async () => {
    await openPdf(`${API_URL}/print/packing-list/${invoice.id}`);
  };
  
  const handlePrintDR = async (type) => {
    await openPdf(`${API_URL}/print/delivery-receipt/${type}/${invoice.id}`);
  };

  // Dot-matrix preview: a dry run, no printer touched. Mode A (pre-printed
  // form) comes back as decoded text; Mode B (full layout) comes back as
  // the dithered page image — same dithering the printer would receive,
  // so what you see here is what would actually print. Trust the
  // response's own content-type rather than assuming one.
  const openPreview = async (url) => {
    try {
      const response = await axios.get(url, { responseType: "blob" });

      const contentType = response.headers["content-type"] || "text/plain";
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank");

      if (!newWindow) {
        showWarningSwal("Popup Blocked", "Please allow popups to view the preview.");
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);
    } catch (err) {
      console.error("Failed to generate preview:", err);

      showErrorSwal(
        "Preview Failed",
        err.response?.data?.message || "Failed to generate the preview. See console for details."
      );
    }
  };

  const handleDotMatrixPreview = async () => {
    await openPreview(
      `${API_URL}/print/invoice/${invoice.id}/dot-matrix/preview?mode=${dotMatrixMode}`
    );
  };

  const handleDotMatrixPrint = async () => {
    const name = printerName.trim();

    if (!name) {
      showWarningSwal("Printer Required", "Enter the shared printer name before printing.");
      return;
    }

    const confirm = await showConfirmSwal({
      title: "Send to printer?",
      text: `This sends the job straight to "${name}" — there's no undo once it reaches the printer. Have you checked the preview?`,
      confirmButtonText: "Print",
      confirmColor: "red",
    });

    if (!confirm.isConfirmed) return;

    localStorage.setItem("dotMatrixPrinterName", name);

    try {
      showLoadingSwal("Printing", "Sending the job to the printer...");

      await axios.get(`${API_URL}/print/invoice/${invoice.id}/dot-matrix`, {
        params: { mode: dotMatrixMode, printer: name },
      });

      setShowDotMatrixModal(false);
      showSuccessSwal("Sent to Printer", "The invoice was sent to the printer.");
    } catch (err) {
      console.error("Failed to print:", err);

      showErrorSwal(
        "Print Failed",
        err.response?.data?.message || "Failed to send the print job. See console for details."
      );
    }
  };

  if (loading) return <div className="m-3">Loading...</div>;
  if (!invoice) return <div className="m-3">Invoice not found</div>;

  const items = invoice.sales_invoice_items || invoice.items || [];

  return (
    <div className="page">
      <div className="page-header">
        <div className="d-flex align-items-center gap-3">
          <div className="po-number">
            Sales Order {String(invoice.order_id).padStart(4, "0")}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn-tertiary-custom"
            onClick={() => setShowPrintModal(true)}
          >
            Save as PDF
          </button>

          <button
            className="btn-tertiary-custom"
            onClick={() => setShowDotMatrixModal(true)}
          >
            Print (Dot Matrix)
          </button>

          <button
            className="btn-primary-custom"
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </button>

          <button
            className="btn-danger-custom"
            onClick={() => setShowReturnModal(true)}
          >
            Return
          </button>

          <button
            className="btn-secondary-custom"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="details-cards-grid">
        <div className="details-main-card">
          <div className="details-card-label">Customer</div>

          <div className="details-entity-name">
            <span className="details-avatar">
              {(invoice.customer?.name || "NA").slice(0, 2).toUpperCase()}
            </span>
            {invoice.customer?.name || "N/A"}
          </div>
        </div>

        <div className="details-info-card">
          <div className="details-card-label">Invoice</div>

          <div className="details-card-row">
            <span className="details-title">No.</span>
            <span className="details-value">{invoice.invoice_number || "—"}</span>
          </div>

          <div className="details-card-row">
            <span className="details-title">Date</span>
            <span className="details-value">{invoice.invoice_date || "—"}</span>
          </div>
        </div>

        <div className="details-info-card">
          <div className="details-card-label">Shipping Details</div>

          <div className="details-card">
            <div className="details-card-row">
              <span className="details-title">Waybill No.</span>
              <span className="details-value mono">
                {invoice.waybill_number || "—"}
              </span>
            </div>

            <div className="details-card-row">
              <span className="details-title">Courier</span>
              <span className="details-value">
                {invoice.courier || "—"}
              </span>
            </div>

            <div className="details-card-row">
              <span className="details-title">Shipping Date</span>
              <span className="details-value">
                {invoice.shipping_date || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <span className="table-title">Products Ordered List</span>
          <span className="item-count">{items.length} items</span>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "28%" }}>Item Name</th>
              <th className="text-center" style={{ width: "16%" }}>Item Code</th>
              <th className="text-center" style={{ width: "10%" }}>Unit</th>
              <th className="text-center" style={{ width: "10%" }}>Qty</th>
              <th className="text-center" style={{ width: "10%" }}>Returned</th>
              <th className="text-center" style={{ width: "13%" }}>Price</th>
              <th className="text-center" style={{ width: "13%" }}>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              //console.log("show:", item)
              const product = item.products || item.product || item.item || {};
              const subtotal = Number(item.quantity || 0) * Number(item.price || 0);

              return (
                <tr key={item.id}>
                  <td>{product.item_name || "—"}</td>

                  <td className="text-center">
                    {product.item_code || "—"}
                  </td>

                  <td className="text-center">
                    {product.unit || "—"}
                  </td>

                  <td className="text-center">
                    {item.quantity}
                  </td>

                  <td className="text-center text-danger-custom">
                    {item.return_qty}
                  </td>

                  <td className="text-center">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="subtotal text-center">
                    {formatCurrency(item.subtotal || subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={5} className="total-label">
                Total
              </td>

              <td className="total-value">
                {formatCurrency(
                  invoice.total_price ||
                    items.reduce((sum, item) => {
                      const subtotal =
                        item.subtotal ||
                        Number(item.quantity || 0) * Number(item.price || 0);

                      return sum + Number(subtotal);
                    }, 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showEditModal && (
        <EditSalesInvoiceModal
          show={showEditModal}
          invoice={invoice}
          onClose={() => setShowEditModal(false)}
          onSuccess={async () => {
            setShowEditModal(false);
            await fetchInvoice();
          }}
        />
      )}

      {showReturnModal && (
        <SalesInvoiceReturnModal
          invoice={invoice}
          onClose={() => setShowReturnModal(false)}
          onSuccess={async () => {
            setShowReturnModal(false);
            await fetchInvoice();
          }}
        />
      )}

      {showPrintModal && (
        <div className="print-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="print-modal" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header">
              <h3>Select Option:</h3>
              <button className="app-modal-close-white" onClick={() => setShowPrintModal(false)}>
                ×
              </button>
            </div>

            <div className="print-modal-actions">
              <button
                className="btn-primary-custom"
                onClick={() => {
                  setShowPrintModal(false);
                  handlePrintPackingList();
                }}
              >
                Packing List
              </button>

              <button
                className="btn-primary-custom"
                onClick={() => {
                  setShowPrintModal(false);
                  handlePrintDR("a");
                }}
              >
                DR with SI
              </button>

              <button
                className="btn-primary-custom"
                onClick={() => {
                  setShowPrintModal(false);
                  handlePrintDR("b");
                }}
              >
                DR without SI
              </button>
            </div>
          </div>
        </div>
      )}

      {showDotMatrixModal && (
        <div className="print-modal-overlay" onClick={() => setShowDotMatrixModal(false)}>
          <div className="print-modal" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header">
              <h3>Dot Matrix Print</h3>
              <button className="app-modal-close-white" onClick={() => setShowDotMatrixModal(false)}>
                ×
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label d-block">Paper</label>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="dotMatrixMode"
                  id="dotMatrixModeForm"
                  checked={dotMatrixMode === "form"}
                  onChange={() => setDotMatrixMode("form")}
                />
                <label className="form-check-label" htmlFor="dotMatrixModeForm">
                  Pre-printed form (boxes/logo already on paper)
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="dotMatrixMode"
                  id="dotMatrixModeFull"
                  checked={dotMatrixMode === "full"}
                  onChange={() => setDotMatrixMode("full")}
                />
                <label className="form-check-label" htmlFor="dotMatrixModeFull">
                  Full layout (blank paper)
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="dotMatrixPrinterName">
                Printer name
              </label>
              <input
                id="dotMatrixPrinterName"
                type="text"
                className="form-control"
                placeholder="e.g. EPSON_LX310"
                value={printerName}
                onChange={(e) => setPrinterName(e.target.value)}
              />
            </div>

            <div className="print-modal-actions">
              <button className="btn-secondary-custom" onClick={handleDotMatrixPreview}>
                Preview
              </button>

              <button className="btn-primary-custom" onClick={handleDotMatrixPrint}>
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}