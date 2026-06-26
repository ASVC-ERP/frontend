import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showLoadingSwal, showSuccessSwal, showErrorSwal, showWarningSwal, showConfirmSwal } from "../../utils/swal";
import "./Suppliers.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateSupplier() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [sidExists, setSidExists] = useState(false);

  const [form, setForm] = useState({
    sid: "",
    name: "",
    address: "",
    currency: "PHP",
    number: "",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
  
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    if (name === "sid") {
      checkSupplierId(value);
    }
  };

  const handleSubmit = async (e) => {
    showLoadingSwal("Creating Supplier", "Please wait whle we add supplier to the database.");
    e.preventDefault();

    if (!form.sid.trim() || !form.name.trim()) {
      alert("Supplier ID and Supplier Name are required");
      return;
    }

    setSaving(true);

    try {
      await axios.post(`${API_URL}/supplier`, form);
      showSuccessSwal("Supplier Created", "Supplier has been added to the database.")
      navigate("/suppliers");
    } catch (err) {
      console.error(err);
      showErrorSwal("Supplier Creation Failed", err)
    } finally {
      setSaving(false);
    }
  };

  const checkSupplierId = async (sid) => {
    if (!sid.trim()) {
      setSidExists(false);
      return;
    }
  
    try {
      const { data } = await axios.get(
        `${API_URL}/supplier/check-sid/${sid}`
      );
  
      setSidExists(data.exists);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="create-supplier-page">
      <div className="create-supplier-card">
        <div className="create-supplier-header">
          <div>
            <h1>Create Supplier</h1>
          </div>
        </div>
  
        <form onSubmit={handleSubmit}>
          <div className="create-section">
            <h5>Supplier Information</h5>
  
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Supplier ID</label>

                <input
                  name="sid"
                  value={form.sid}
                  onChange={handleChange}
                  className={`form-control ${sidExists ? "is-invalid" : ""}`}
                  placeholder="Supplier ID"
                  maxLength={50}
                />

                {sidExists && (
                  <div className="invalid-feedback d-block">
                    Supplier ID already exists.
                  </div>
                )}
              </div>
  
              <div className="col-md-4">
                <label className="form-label">Supplier Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Supplier name"
                  maxLength={50}
                />
              </div>
  
              <div className="col-md-4">
                <label className="form-label">Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="PHP">PHP</option>
                  <option value="USD">USD</option>
                  <option value="JPY">JPY</option>
                  <option value="KRW">KRW</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
  
              <div className="col-md-4">
                <label className="form-label">Contact Number</label>
                <input
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Contact number"
                  maxLength={50}
                />
              </div>
  
              <div className="col-md-8">
                <label className="form-label">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Supplier address"
                  maxLength={250}
                />
              </div>
            </div>
          </div>
  
          <div className="create-actions">
            <button
              type="button"
              className="btn-secondary-custom"
              onClick={() => navigate("/suppliers")}
            >
              Cancel
            </button>
  
            <button
              type="submit"
              className="btn-primary-custom"
              disabled={sidExists}
            >
              {saving ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}