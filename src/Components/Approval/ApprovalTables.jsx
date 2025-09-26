import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Check, X } from "lucide-react";
import { IoIosSearch } from "react-icons/io";
import axios from "axios";
import Swal from "sweetalert2";

function ApprovalTables() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/orders/sales-orders/by-status`, {
        params: { status: activeTab },
      });
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch orders. Please try again later.");
      console.error("Error fetching orders:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleApprove = async () => {
    try {
      const response = await axios.post(`${API_URL}/orders/serve-approved`, {
        orderIds: selectedOrders,
      });

      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Selected orders have been approved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error approving orders:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve orders. Please try again.",
      });
    }
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((field) =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectRow = (row) => {
    const updated = selectedOrders.includes(row.orderID)
      ? selectedOrders.filter((id) => id !== row.orderID)
      : [...selectedOrders, row.orderID];
    setSelectedOrders(updated);
  };

  const handleSelectAll = (isChecked) => {
    setSelectedOrders(isChecked ? data.map((row) => row.orderID) : []);
  };

  const handleReject = async () => {
    try {
      await axios.post(`${API_URL}/orders/reject`, {
        orderIds: selectedOrders,
      });

      Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: "Selected orders have been rejected successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setSelectedOrders([]);
      fetchOrders(); // refresh after reject
    } catch (error) {
      console.error("Error rejecting orders:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject orders. Please try again.",
      });
    }
  };

  const columns = [
    {
      name:
        activeTab === "Pending" ? (
          <input
            type="checkbox"
            onChange={(e) => handleSelectAll(e.target.checked)}
            checked={
              data.length > 0 &&
              data.every((row) => selectedOrders.includes(row.orderID))
            }
          />
        ) : null,
      cell: (row) =>
        activeTab === "Pending" ? (
          <input
            type="checkbox"
            checked={selectedOrders.includes(row.orderID)}
            onChange={() => handleSelectRow(row)}
          />
        ) : null,
      ignoreRowClick: true,
      width: "60px", // fixed small
    },
    {
      name: "Order ID",
      selector: (row) => row.orderID,
      sortable: true,
      width: "120px",
    },
    {
      name: "Date",
      selector: (row) =>
        row.date ? new Date(row.date).toLocaleDateString("en-US") : "",
      sortable: true,
      width: "120px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      wrap: true,
      minWidth: "200px",
      grow: 3, 
    },
    {
      name: "Address",
      selector: (row) => row.customerAddress,
      sortable: true,
      grow: 4,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: "PIC",
      selector: (row) => row.salesAgent,
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Pending"
              ? "bg-warning text-dark"
              : row.status === "Served"
              ? "bg-success"
              : row.status === "Rejected"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
      width: "120px", // consistent badge size
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="nav nav-tabs my-3">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`nav-link ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm("");
              setSelectedOrders([]);
            }}
            style={{
              backgroundColor: activeTab === tab ? "#0C1D61" : "#ffffff",
              color: activeTab === tab ? "white" : "#0C1D61",
              border: activeTab === tab ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3 position-relative w-25">
        <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
        <input
          type="text"
          placeholder="Search"
          className="form-control ps-5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Action Buttons (only on Pending) */}
      {activeTab === "Pending" && (
        <div className="d-flex gap-2 mb-3">
          <button
            onClick={handleApprove}
            className="btn btn-success"
            disabled={selectedOrders.length === 0}
          >
            <Check size={16} /> Approve
          </button>
          <button
            onClick={handleReject}
            className="btn btn-danger"
            disabled={selectedOrders.length === 0}
          >
            <X size={16} /> Reject
          </button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        className="custom-data-table"
        pagination
        noHeader
        highlightOnHover
        responsive
        fixedHeader
        fixedHeaderScrollHeight="400px"
        progressPending={loading}
      />
    </div>
  );
}

export default ApprovalTables;
