import React, { useEffect, useState } from "react";
import axios from "axios";
import { showSuccessSwal, showErrorSwal, showWarningSwal, showLoadingSwal, } from "../../utils/swal";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditSalesInvoiceModal({
  show,
  invoice,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    invoice_number: "",
    waybill_number: "",
    courier: "",
    shipping_date: "",
  });

  useEffect(() => {
    if (!invoice) return;

    setForm({
      invoice_number: invoice.invoice_number || "",
      waybill_number: invoice.waybill_number || "",
      courier: invoice.courier || "",
      shipping_date: invoice.shipping_date || "",
    });
  }, [invoice]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      showLoadingSwal("Updating Inovice", "Please wait while we update this invoice...")
      await axios.patch(`${API_URL}/invoice/${invoice.id}`, form);

      showSuccessSwal("Invoice Updated", "Sales invoice has been updated successfully.")
      onSuccess();
    } catch (err) {
      console.error(err);

      showErrorSwal("Update Failed",  err.response?.data?.message || "Failed to update invoice. Please contact administrator.")
    }
  };

  return (
    <div className="app-modal-backdrop">
      <div className="app-modal app-modal-md">
        <div className="app-modal-content">
          <div className="app-modal-header">
            <div>
              <h5>Edit Sales Invoice</h5>
              <span>Update invoice, delivery, and shipping details</span>
            </div>

            <button className="app-modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="app-modal-body">
            <div className="modal-form">
              <div className="modal-form-section">
                <div className="modal-form-section-title">
                  Invoice Information
                </div>

                <label className="form-label">Invoice Number</label>
                <input
                  type="text"
                  name="invoice_number"
                  className="form-control"
                  value={form.invoice_number}
                  onChange={handleChange}
                  placeholder="Enter invoice number"
                  maxLength={50}
                />
              </div>

              <div className="modal-form-section">
                <div className="modal-form-section-title">
                  Shipping Details
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Waybill Number</label>
                    <input
                      type="text"
                      name="waybill_number"
                      className="form-control"
                      value={form.waybill_number}
                      onChange={handleChange}
                      placeholder="Enter waybill number"
                      maxLength={50}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Courier</label>
                    <input
                      type="text"
                      name="courier"
                      className="form-control"
                      value={form.courier}
                      onChange={handleChange}
                      placeholder="Enter courier"
                      maxLength={50}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Shipping Date</label>
                    <input
                      type="date"
                      name="shipping_date"
                      className="form-control"
                      value={form.shipping_date || ""}
                      maxLength={50}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="app-modal-footer">
            <button className="btn-secondary-custom" onClick={onClose}>
              Cancel
            </button>

            <button className="btn-primary-custom" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}