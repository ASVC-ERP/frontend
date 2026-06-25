import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import EditPurchaseModal from "./EditPurchase";
import ReturnPurchaseModal from "./ReturnPurchase";
import "./PurchaseDetails.css"

export const imsSwal = Swal.mixin({
  customClass: { popup: "ims-swal", confirmButton: "ims-swal-confirm", cancelButton: "ims-swal-cancel", },
  buttonsStyling: false,
});

const formatCurrency = (value) => Number(value).toLocaleString("en-PH", { style: "currency", currency: "PHP", });
const API_URL = import.meta.env.VITE_API_URL;

export default function PurchaseDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(null);

  useEffect(() => { fetchInvoice(); }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`${API_URL}/supplier-invoice/id/${id}`);
      console.log(res.data)
      setInvoice(res.data);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="m-3">Loading...</div>;
  if (!invoice) return <div className="m-3">Invoice not found</div>;

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

      imsSwal.fire({
        title: "Editing Invoice",
        text: "Please wait while we edit your invoice...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => imsSwal.showLoading(),
      });

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
  
      await axios.put(
        `${API_URL}/supplier-invoice/${invoice.id}`,
        payload
      );
      setShowEditModal(false);

      imsSwal.fire({
        icon: "success",
        iconColor: "#1E5A84",
        title: "Invoice Edited",
        text: `Invoice has been successfully edited.`,
        confirmButtonColor: "#1E5A84",
      }).then(() => {
        window.location.reload();
      });
  
      await fetchInvoice();
    } catch (err) {
      console.error(err);
      imsSwal.fire({
        icon: "error",
        iconColor: "#dc3545",
        title: "Posting Failed",
        text:
          err.response?.data?.message ||
          "Failed to edit invoice. Please try again.",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handlePostInvoice = async () => {
    const result = await imsSwal.fire({
      icon: "warning",
      title: "Post Invoice?",
      html: `
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
      showCancelButton: true,
      confirmButtonText: "Yes, Post",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#639922",
      cancelButtonColor: "#6c757d",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      imsSwal.fire({
        title: "Posting Invoice",
        text: "Please wait while we post your invoice...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => imsSwal.showLoading(),
      });
  
      await axios.patch(`${API_URL}/supplier-invoice/${invoice.id}/post`);
  
      imsSwal.fire({
        icon: "success",
        iconColor: "#639922",
        title: "Invoice Posted",
        text: "Invoice has been successfully posted.",
        confirmButtonColor: "#639922",
      });
  
      await fetchInvoice();
    } catch (err) {
      console.error(err);
  
      imsSwal.fire({
        icon: "error",
        iconColor: "#dc3545",
        title: "Posting Failed",
        text:
          err.response?.data?.message ||
          "Failed to post invoice. Please try again.",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="d-flex align-items-center gap-3">
          <div className="po-number">Purchase Order {invoice.po_number}</div>
          <span className={`status-badge ${invoice.status.toLowerCase()}`}>
            {invoice.status}
          </span>
        </div>

        {/* RIGHT: Actions */}
        <div className="d-flex align-items-center gap-2">
          {invoice.status?.toUpperCase() !== "POSTED" && (
            <>
              <button
                className="btn edit-btn"
                onClick={openEditModal}
              >
                Edit
              </button>

              <button
                className="btn post-btn"
                onClick={handlePostInvoice}
              >
                Post
              </button>
            </>
          )}

          {invoice.status?.toUpperCase() === "POSTED" && (
            <button
              className="btn return-btn"
              onClick={() => setShowReturnModal(true)}
            >
              Return Items
            </button>
          )}

        </div>
      </div>
  
      <div className="cards-grid">
        <div className="supplier-card">
          <div className="supplier-label">Supplier</div>
          <div className="supplier-name">
            <span className="supplier-avatar">
              {invoice.suppliers.name.slice(0, 2).toUpperCase()}
            </span>
            {invoice.suppliers.name}
          </div>
        </div>
        <div className="info-card" style={{ borderLeftColor: "#639922" }}>
          <div className="card-label">Invoice number</div>
          <div className="card-value mono">{invoice.invoice_number}</div>
        </div>
        <div className="info-card">
          <div className="card-label">Purchase date</div>
          <div className="card-value">{invoice.purchase_date}</div>
        </div>
      </div>
  
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-title">Products Purchased List</span>
          <span className="item-count">
            {invoice.supplier_invoice_items.length} items
          </span>
        </div>
        <table className="items-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "24%" }}>Item name</th>
              <th className="text-center" style={{ width: "14%" }}>Item code</th>
              <th className="text-center" style={{ width: "12%" }}>Unit cost</th>
              <th className="text-center" style={{ width: "8%" }}>Unit</th>
              <th className="text-center" style={{ width: "8%" }}>Qty</th>
              <th className="text-center" style={{ width: "10%" }}>Returned</th>
              <th className="text-center" style={{ width: "10%" }}>Remaining</th>
              <th className="text-center" style={{ width: "14%" }}>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {invoice.supplier_invoice_items.map((item) => {
              const returnedQty = Number(item.ret_qty || 0);
              const remainingQty = Number(item.quantity) - returnedQty;

              return (
                <tr key={item.id}>
                  <td>{item.products.item_name}</td>

                  <td className="text-center">
                    {item.products.item_code}
                  </td>

                  <td className="text-center">
                    {formatCurrency(item.unit_cost)}
                  </td>

                  <td className="text-center">
                    {item.products.unit}
                  </td>

                  <td className="text-center">
                    {item.quantity}
                  </td>

                  <td className="returned-qty text-center">
                    {returnedQty}
                  </td>

                  <td className="remaining-qty text-center">
                    {remainingQty}
                  </td>

                  <td className="subtotal text-center">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7} className="total-label">
                Total
              </td>

              <td className="total-value">
                {formatCurrency(
                  invoice.supplier_invoice_items.reduce(
                    (sum, i) => sum + Number(i.subtotal),
                    0
                  )
                )}
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