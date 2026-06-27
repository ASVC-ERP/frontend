import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessSwal, showErrorSwal, showWarningSwal, showLoadingSwal, showConfirmSwal, } from "../../utils/swal";
import { useParams, useNavigate } from "react-router-dom";
import EditPurchaseModal from "./EditPurchase";
import ReturnPurchaseModal from "./ReturnPurchase";
import "../../styles/details-page.css";
import "./PurchaseDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (value) => Number(value || 0)
  .toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
});

export default function PurchaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`${API_URL}/supplier-invoice/id/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setInvoiceForm({
      invoice_number: invoice.invoice_number,
      po_number: invoice.po_number,
      purchase_date: invoice.purchase_date,
      supplier_id: invoice.supplier_id,
      conversion_factor: invoice.conversion_factor,

      items: invoice.supplier_invoice_items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        itemName: item.products.item_name,
        itemCode: item.products.item_code,
        unit: item.products.unit,
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
      })),
    });

    setShowEditModal(true);
  };

  const handleUpdateInvoice = async () => {
    try {
      showLoadingSwal("Editing Invoice", "Please wait while we edit your invoice...");

      const payload = {
        invoice_number: invoiceForm.invoice_number,
        po_number: invoiceForm.po_number,
        purchase_date: invoiceForm.purchase_date,
        supplier_id: invoiceForm.supplier_id,
        conversion_factor: Number(invoiceForm.conversion_factor),

        items: invoiceForm.items.map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost),
        })),
      };

      await axios.put(`${API_URL}/supplier-invoice/${invoice.id}`, payload);

      setShowEditModal(false);

      showSuccessSwal("Invoice Edited", "Invoice has been successfully edited.")
      .then(() => {
        window.location.reload();
      });

      await fetchInvoice();
    } catch (err) {
      console.error(err);
      showErrorSwal("Editing Failed", err.response?.data?.message || "Failed to edit invoice. Please try again.");
    }
  };

  const handlePostInvoice = async () => {

    const result = await showConfirmSwal({
      title: "Post Invoice?",
      html: 
      `
        <div class="post-warning">
          <p>This action will:</p>
          <ul>
            <li>Update product inventory stock</li>
            <li>Update product cost values</li>
            <li>Mark invoice as <strong>POSTED</strong></li>
          </ul>
          <p class="warning-note">
            This action cannot be easily reversed.
          </p>
        </div>
      `, 
      confirmButtonText: "Yes, Post",
      cancelButtonText: "Cancel",
      confirmColor: "green",
  })

    if (!result.isConfirmed) return;

    try {
      showLoadingSwal("Posting Invoice", "Please wait while we post your invoice...");
      await axios.patch(`${API_URL}/supplier-invoice/${invoice.id}/post`);
      showSuccessSwal("Invoice Posted", "Invoice has been successfully posted.");
      await fetchInvoice();
    } catch (err) {
      console.error(err);
      showErrorSwal("Posting Failed", err.response?.data?.message || "Failed to post invoice. Please try again.")
    }
  };

  const openPdf = async (url) => {
    try {
      const response = await axios.get(url, { responseType: "blob", });
      const blob = new Blob([response.data], { type: "application/pdf", });
      const blobUrl = window.URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank");
      if (!newWindow) { showWarningSwal("Popup Blocked","Please allow popups to view the PDF.") }
      setTimeout(() => { window.URL.revokeObjectURL(blobUrl); }, 10000);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showErrorSwal("Print Failed","Failed to generate PDF. See console for details.");
    }
  };

  const handlePrintPO = async (type) => {
    await openPdf(`${API_URL}/print/purchase-order/${invoice.id}`);
  };

  if (loading) return <div className="m-3">Loading...</div>;
  if (!invoice) return <div className="m-3">Invoice not found</div>;

  const totalAmount = invoice.supplier_invoice_items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  return (
    <div className="details-page">
      <div className="details-page-header">
        <div>
          <div className="d-flex align-items-center gap-3">
            <div className="details-page-title">
              Purchase Order {invoice.po_number}
            </div>

            <span
              className={`details-status-badge ${invoice.status?.toLowerCase()}`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="details-page-subtitle">
            Supplier invoice details and purchased items
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {invoice.status?.toUpperCase() !== "POSTED" && (
            <>
              <button className="btn-primary-custom" onClick={openEditModal}>
                Edit
              </button>

              <button className="btn-tertiary-custom" onClick={handlePostInvoice}>
                Post
              </button>
            </>
          )}

          <button
            className="btn-primary-custom"
            onClick={() => { handlePrintPO(); }}
          >
            Save as PDF
          </button>

          {invoice.status?.toUpperCase() === "POSTED" && (
            <button
              className="btn-danger-custom"
              onClick={() => setShowReturnModal(true)}
            >
              Return Items
            </button>
          )}

          <button
            type="button"
            className="btn-secondary-custom"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="details-cards-grid">
        <div className="details-main-card">
          <div className="details-card-label">Supplier</div>

          <div className="details-entity-name">
            <span className="details-avatar">
              {invoice.suppliers?.name?.slice(0, 2).toUpperCase()}
            </span>

            {invoice.suppliers?.name}
          </div>
        </div>

        <div
          className="details-info-card"
          style={{ "--accent": "#639922" }}
        >
          <div className="details-card-label">Invoice Number</div>
          <div className="details-card-value mono">
            {invoice.invoice_number}
          </div>
        </div>

        <div className="details-info-card">
          <div className="details-card-label">Purchase Date</div>
          <div className="details-card-value">{invoice.purchase_date}</div>
        </div>
      </div>

      <div className="details-table-card">
        <div className="details-table-header">
          <span className="details-table-title">Products Purchased List</span>

          <span className="details-item-count">
            {invoice.supplier_invoice_items.length} items
          </span>
        </div>

        <table className="details-table">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Item Name</th>
              <th style={{ width: "14%" }}>Item Code</th>
              <th style={{ width: "12%" }}>Unit Cost</th>
              <th style={{ width: "8%" }}>Unit</th>
              <th style={{ width: "8%" }}>Qty</th>
              <th style={{ width: "10%" }}>Returned</th>
              <th style={{ width: "10%" }}>Remaining</th>
              <th style={{ width: "14%" }}>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {invoice.supplier_invoice_items.map((item) => {
              const returnedQty = Number(item.ret_qty || 0);
              const quantity = Number(item.quantity || 0);
              const remainingQty = quantity - returnedQty;

              return (
                <tr key={item.id}>
                  <td>{item.products?.item_name}</td>
                  <td>{item.products?.item_code}</td>
                  <td>{formatCurrency(item.unit_cost)}</td>
                  <td>{item.products?.unit}</td>
                  <td>{quantity}</td>
                  <td className="text-danger-custom">{returnedQty}</td>
                  <td className="text-success-custom">{remainingQty}</td>
                  <td className="details-subtotal">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={7}>
                <div className="details-total-label">Total</div>
              </td>

              <td className="details-total-value">
                {formatCurrency(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <EditPurchaseModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        invoiceForm={invoiceForm}
        setInvoiceForm={setInvoiceForm}
        onSave={handleUpdateInvoice}
      />

      <ReturnPurchaseModal
        show={showReturnModal}
        invoice={invoice}
        onClose={() => setShowReturnModal(false)}
        onSuccess={async () => {
          setShowReturnModal(false);
          await fetchInvoice();
        }}
      />
    </div>
  );
}