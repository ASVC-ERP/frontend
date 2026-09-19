import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  showLoadingSwal,
  showSuccessSwal,
  showErrorSwal,
  showWarningSwal,
  showConfirmSwal,
  imsSwal,
} from "../../utils/swal";
import { PW_HINT, passwordProblem, generatePassword } from "../../utils/password";
import "../../styles/create-page.css";
import "../../styles/page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { username: "", name: "", password: "", role: "agent" };

const isLocked = (u) =>
  !!u.locked_until && new Date(u.locked_until).getTime() > Date.now();

export default function Users() {
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user`);
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers([...data].sort((a, b) => a.id - b.id));
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

  const toggleActive = async (u) => {
    const disabling = u.active !== false;
    const res = await showConfirmSwal({
      title: disabling ? `Disable ${u.username}?` : `Enable ${u.username}?`,
      text: disabling
        ? "They'll be signed out shortly and can't log in until re-enabled."
        : "They'll be able to log in again.",
      confirmButtonText: disabling ? "Disable" : "Enable",
      confirmColor: disabling ? "red" : "green",
    });
    if (!res.isConfirmed) return;
    try {
      await axios.put(`${API_URL}/user/${u.id}`, { active: !disabling });
      fetchUsers();
      showSuccessSwal(
        disabling ? "User disabled" : "User enabled",
        `${u.username} has been updated.`,
      );
    } catch (err) {
      showErrorSwal("Update failed", err.response?.data?.message || "Please try again.");
    }
  };

  const unlockUser = async (u) => {
    const res = await showConfirmSwal({
      title: `Unlock ${u.username}?`,
      text: "Clears the lockout so they can try signing in again right away.",
      confirmButtonText: "Unlock",
      confirmColor: "green",
    });
    if (!res.isConfirmed) return;
    try {
      await axios.put(`${API_URL}/user/${u.id}`, { unlock: true });
      fetchUsers();
      showSuccessSwal("User unlocked", `${u.username} can sign in again.`);
    } catch (err) {
      showErrorSwal("Unlock failed", err.response?.data?.message || "Please try again.");
    }
  };

  const resetPassword = async (u) => {
    const { value: newPw, isConfirmed } = await imsSwal.fire({
      title: `Reset password for ${u.username}`,
      input: "text",
      inputValue: generatePassword(),
      inputLabel: "New password — use the generated one or type your own",
      inputAttributes: { autocapitalize: "off", autocorrect: "off", spellcheck: "false" },
      showCancelButton: true,
      confirmButtonText: "Reset password",
      inputValidator: (v) => passwordProblem(v || "") || undefined,
      customClass: {
        popup: "ims-swal",
        title: "ims-swal-title",
        confirmButton: "ims-swal-confirm",
        cancelButton: "ims-swal-cancel",
      },
      buttonsStyling: false,
    });
    if (!isConfirmed || !newPw) return;
    try {
      await axios.put(`${API_URL}/user/${u.id}`, { password: newPw });
      fetchUsers();
      await imsSwal.fire({
        icon: "success",
        iconColor: "#639922",
        title: "Password reset",
        html: `Give this to <b>${u.username}</b> — they'll be signed out and must use it to log in:<br><br><code style="font-size:1.1rem;user-select:all">${newPw}</code>`,
        confirmButtonText: "OK",
        customClass: { popup: "ims-swal", confirmButton: "ims-swal-confirm" },
        buttonsStyling: false,
      });
    } catch (err) {
      showErrorSwal("Reset failed", err.response?.data?.message || "Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.name.trim()) {
      showWarningSwal("Missing fields", "Username and name are required.");
      return;
    }
    const pwProblem = passwordProblem(form.password);
    if (pwProblem) {
      showWarningSwal("Weak password", pwProblem);
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
      { name: "Username", selector: (r) => r.username, sortable: true, grow: 2 },
      { name: "Name", selector: (r) => r.name || "-", sortable: true, grow: 2 },
      {
        name: "Role",
        cell: (r) => (
          <span className={`badge ${r.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
            {r.role || "-"}
          </span>
        ),
        grow: 1,
        center: true,
      },
      {
        name: "Status",
        cell: (r) => {
          if (r.active === false)
            return <span className="badge bg-secondary">Disabled</span>;
          if (isLocked(r))
            return <span className="badge bg-warning text-dark">Locked</span>;
          return <span className="badge bg-success">Active</span>;
        },
        grow: 1,
        center: true,
      },
      {
        name: "Created",
        selector: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"),
        grow: 1,
        center: true,
      },
      {
        name: "",
        cell: (r) => (
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", width: "100%" }}>
            <button
              className="btn-secondary-custom"
              style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={() => toggleActive(r)}
            >
              {r.active === false ? "Enable" : "Disable"}
            </button>
            {isLocked(r) && (
              <button
                className="btn-secondary-custom"
                style={{ padding: "4px 10px", fontSize: 12 }}
                onClick={() => unlockUser(r)}
              >
                Unlock
              </button>
            )}
            <button
              className="btn-secondary-custom"
              style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={() => resetPassword(r)}
            >
              Reset PW
            </button>
          </div>
        ),
        grow: 2,
        right: true,
        ignoreRowClick: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="page-container page-container--fixed-table">
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <p className="page-subtitle">Create and manage admin and agent accounts.</p>
        </div>
      </div>

      <div className="page-card" style={{ marginBottom: 20, flexShrink: 0 }}>
        <form onSubmit={handleSubmit}>
          <h5 style={{ fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
            Add User
          </h5>

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
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <div className="form-text">{PW_HINT}</div>
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
      </div>

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
  );
}
