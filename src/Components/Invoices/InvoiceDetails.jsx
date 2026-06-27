import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import EditSalesInvoiceModal from "./EditInvoice";
import "../Purchases/Purchases.css";
import "../../styles/modal.css"
import { showErrorSwal, showWarningSwal } from "../../utils/swal";
import SalesInvoiceReturnModal from "./ReturnInvoice";

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

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoice/${id}`);
      console.log(res.data);
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

      <div className="cards-grid">
        <div className="supplier-card">
          <div className="supplier-label">Customer</div>

          <div className="supplier-name">
            <span className="supplier-avatar">
              {(invoice.customer?.name || "NA").slice(0, 2).toUpperCase()}
            </span>
            {invoice.customer?.name || "N/A"}
          </div>
        </div>

        <div className="info-card">
          <div className="card-label">Invoice date</div>
          <div className="card-value">{invoice.invoice_date || "—"}</div>
        </div>

        <div className="info-card">
          <div className="card-label">Waybill number</div>
          <div className="card-value mono">
            {invoice.waybill_number || "—"}
          </div>
        </div>

        <div className="info-card">
          <div className="card-label">Courier</div>
          <div className="card-value">{invoice.courier || "—"}</div>
        </div>

        <div className="info-card">
          <div className="card-label">Shipping date</div>
          <div className="card-value">{invoice.shipping_date || "—"}</div>
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
    </div>
  );
}