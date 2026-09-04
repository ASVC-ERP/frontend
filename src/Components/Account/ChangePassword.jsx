import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAccessToken } from "../../api/http";
import {
  showLoadingSwal,
  showSuccessSwal,
  showErrorSwal,
  showWarningSwal,
} from "../../utils/swal";
import { PW_HINT, passwordProblem } from "../../utils/password";
import "../../styles/create-page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword) {
      showWarningSwal("Missing field", "Enter your current password.");
      return;
    }
    const problem = passwordProblem(form.newPassword);
    if (problem) {
      showWarningSwal("Weak password", problem);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showWarningSwal("Passwords don't match", "Re-type the new password to confirm.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      showWarningSwal("Same password", "The new password must be different.");
      return;
    }

    setSaving(true);
    showLoadingSwal("Updating password", "Please wait.");
    try {
      const res = await axios.post(`${API_URL}/authenticate/change-password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      // Server rotated our session; keep the new access token in memory.
      if (res.data?.access_token) setAccessToken(res.data.access_token);
      setForm(EMPTY);
      await showSuccessSwal(
        "Password changed",
        "Your other sessions have been signed out. This one stays active.",
      );
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        showErrorSwal("Incorrect password", "Your current password is wrong.");
      } else {
        showErrorSwal(
          "Could not change password",
          err.response?.data?.message || "Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-card">
        <div className="create-header">
          <div>
            <h1>Change Password</h1>
            <p>Update the password for your own account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="create-section">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Current password</label>
                <input
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="form-control"
                  autoComplete="current-password"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">New password</label>
                <input
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="form-control"
                  autoComplete="new-password"
                />
                <div className="form-text">{PW_HINT}</div>
              </div>

              <div className="col-md-4">
                <label className="form-label">Confirm new password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="create-actions">
            <button
              type="button"
              className="btn-secondary-custom"
              onClick={() => navigate("/")}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary-custom" disabled={saving}>
              {saving ? "Updating..." : "Change password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
