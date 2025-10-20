import React, { useState, useEffect } from "react";
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleRowClick = async (row) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${row.orderID}`);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch order details",
        text: "Please try again later.",
      });
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/orders/sales-orders/by-status`,
        {
          params: { status: activeTab },
        }
      );
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
      console.log("Reject payload:", { orderIds: selectedOrders });

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
      name: (
        <input
          type="checkbox"
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={
            data.length > 0 &&
            data.every((row) => selectedOrders.includes(row.orderID))
          }
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(row.orderID)}
          onChange={() => handleSelectRow(row)}
        />
      ),
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
      <div className="d-flex justify-content-between align-items-center">
        {/* Search */}
        <div className=" position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text" 
            placeholder="Search approvals"
            className="form-control ps-5 border-2 rounded-3"
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
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        className="custom-data-table"
        pagination
        paginationPerPage={20}
        noHeader
        highlightOnHover
        responsive
        fixedHeader
        fixedHeaderScrollHeight="400px"
        progressPending={loading}
        onRowClicked={handleRowClick}
      />

      {showModal && selectedOrder && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div
              className="modal-dialog modal-xl modal-dialog-centered"
              role="document"
              style={{ height: "90vh", maxHeight: "90vh" }}
            >
              <div
                className="modal-content"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* HEADER */}
                <div
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden"
                  style={{
                    background: "#246c9d",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    cursor: "move",
                  }}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <p className="mb-2 opacity-75" style={{ fontSize: "20px" }}>
                      {selectedOrder.orderId}
                    </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">
                      Customer: {selectedOrder.customerName}
                    </h5>
                  </div>
                </div>

                {/* BODY */}
                <div className="modal-body">
                  <div
                    className="rounded-3"
                    style={{
                      maxHeight: "430px",
                      overflowY: "auto",
                    }}
                  >
                    <ul className="list-unstyled">
                      {selectedOrder.orderedItems?.map((item, index) => (
                        <React.Fragment key={index}>
                          <li>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              {/* Product Info */}
                              <div className="d-flex flex-column">
                                <span className="fw-semibold">
                                  {item.itemName}
                                </span>

                                <small className="text-muted">
                                  Unit Price: ₱
                                  {item.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  | Qty: {item.quantity}
                                </small>

                                {item.discPercent > 0 && (
                                  <small className="text-danger">
                                    Discount: {item.discPercent}% ( ₱
                                    {(
                                      (parseFloat(item.price) || 0) *
                                      (parseInt(item.quantity) || 0) *
                                      (item.discPercent / 100)
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                    )
                                  </small>
                                )}
                              </div>

                              {/* Price */}
                              <div className="text-end d-flex flex-column">
                                <span className="fw-semibold">
                                  ₱
                                  {(item.price * item.quantity).toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 2 }
                                  )}
                                </span>
                              </div>
                            </div>
                          </li>
                          <hr className="my-0 border-secondary" />
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>

                  {/* TOTAL */}
                  <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                    <span className="h5 fw-semibold ">Total</span>
                    <span className="fw-bold h5">
                      ₱
                      {selectedOrder.totalPrice?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ApprovalTables;
