import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  showLoadingSwal,
  showSuccessSwal,
  showErrorSwal,
  showWarningSwal,
} from "../../utils/swal";
import "../../styles/create-page.css";
import "../../styles/page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { username: "", name: "", password: "", role: "agent" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      showErrorSwal("Could not load users", "Please try again.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.name.trim()) {
      showWarningSwal("Missing fields", "Username and name are required.");
      return;
    }
    if (form.password.length < 6) {
      showWarningSwal("Weak password", "Password must be at least 6 characters.");
      return;
    }

    const newUsername = form.username.trim();
    setSaving(true);
    showLoadingSwal("Creating user", "Please wait while we add the account.");
    try {
      await axios.post(`${API_URL}/user`, {
        username: newUsername,
        name: form.name.trim(),
        password: form.password,
        role: form.role,
      });
      setForm(EMPTY_FORM);
      fetchUsers();
      showSuccessSwal("User created", `${newUsername} can now sign in.`);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      if (status === 409) {
        showErrorSwal("Username taken", "Pick a different username.");
      } else if (status === 403) {
        showErrorSwal("Not allowed", "Only admins can create users.");
      } else {
        showErrorSwal("Could not create user", err.response?.data?.message || "Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { name: "ID", selector: (r) => r.id, width: "80px", center: true },
      { name: "Username", selector: (r) => r.username, sortable: true, grow: 1 },
      { name: "Name", selector: (r) => r.name || "-", sortable: true, grow: 1 },
      {
        name: "Role",
        cell: (r) => (
          <span className={`badge ${r.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
            {r.role || "-"}
          </span>
        ),
        width: "140px",
        center: true,
      },
      {
        name: "Created",
        selector: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"),
        width: "160px",
        center: true,
      },
    ],
    [],
  );

  return (
    <div className="create-page">
      <div className="create-card">
        <div className="create-header">
          <div>
            <h1>Users</h1>
            <p>Create and manage admin and agent accounts.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="create-section">
            <h5>Add User</h5>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. jdoe"
                  maxLength={50}
                  autoComplete="off"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                  maxLength={100}
                  autoComplete="off"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="create-actions">
            <button
              type="button"
              className="btn-secondary-custom"
              onClick={() => setForm(EMPTY_FORM)}
              disabled={saving}
            >
              Reset
            </button>
            <button type="submit" className="btn-primary-custom" disabled={saving}>
              {saving ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>

        <div className="create-section" style={{ marginTop: 8 }}>
          <h5>Existing Users</h5>
          <div className="custom-data-table-wrapper">
            <DataTable
              columns={columns}
              data={users}
              highlightOnHover
              striped
              responsive
              className="custom-data-table"
              noDataComponent="No users found"
              progressPending={tableLoading}
              progressComponent={
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <div
                    className="spinner-border"
                    style={{ color: "#1E5A84", width: "2.5rem", height: "2.5rem" }}
                  />
                  <div style={{ marginTop: 10, color: "#6c757d", fontWeight: 600 }}>
                    Loading users...
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
