import React, { useState, useEffect } from "react";
import axios from "axios";
import { showLoadingSwal, showSuccessSwal, showErrorSwal, showWarningSwal, showConfirmSwal } from "../../utils/swal";
import { useDraggableModal } from "../../hooks/useDraggableModal";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditSupplierModal({
  show,
  supplier,
  onClose,
  onSuccess,
}) {

  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const [form, setForm] = useState({
    sid: "",
    name: "",
    address: "",
    currency: "",
    number: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplier) {
      setForm({
        sid: supplier.sid || "",
        name: supplier.name || "",
        address: supplier.address || "",
        currency: supplier.currency || "",
        number: supplier.number || "",
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!supplier) return;

    setSaving(true);
    showLoadingSwal("Updating Supplier", "Please Wait while we update this supplier.")
    try {
      await axios.put( `${API_URL}/supplier/${supplier.id}`, form );

      await showSuccessSwal(
        "Supplier Updated",
        `${form.name} was updated successfully.`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      await showErrorSwal(
        "Update Failed",
        err?.response?.data?.message ||
          "Failed to update supplier."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="app-modal-backdrop"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}  
    >
      <div className="app-modal app-modal-md">
        <div className="app-modal-content">
          <div 
            className="app-modal-header cursor-move"
            onMouseDown={handleHeaderMouseDown}
          >
            <div>
              <h5>Edit Supplier</h5>
              <span>Update supplier information</span>
            </div>

            <button
              type="button"
              className="app-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="app-modal-body">
            <form className="modal-form">
              <div className="modal-form-section">
                <div className="modal-form-section-title">
                  Supplier Information
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      Supplier ID
                    </label>

                    <input
                      name="sid"
                      value={form.sid}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">
                      Supplier Name
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">
                      Address
                    </label>

                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      Currency
                    </label>

                    <input
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">
                      Number
                    </label>

                    <input
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      className="form-control"
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
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary-custom"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">

          <div
            className="modal-header text-white"
            style={{
              background:
                "linear-gradient(135deg, #1E5A84, #2C7CB0)",
            }}
          >
            <h5 className="modal-title">
              Edit Supplier
            </h5>

            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="row g-3">

              <div className="col-md-4">
                <label className="form-label">
                  Supplier ID
                </label>

                <input
                  name="sid"
                  value={form.sid}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">
                  Supplier Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Currency
                </label>

                <input
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">
                  Number
                </label>

                <input
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary-custom"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary-custom"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}