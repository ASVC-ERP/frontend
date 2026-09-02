import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EditOrderModal from "./EditOrder";
import ServeOrderModal from "./ServeOrder";
import "../../styles/details-page.css";
import Modal from "react-bootstrap/Modal";
import CostHistoryTab from "../Inventory/InventoryTabs/CostHistoryTab";
import { showSuccessSwal, showErrorSwal, showWarningSwal, showLoadingSwal, showConfirmSwal } from "../../utils/swal";
import { debug } from "../../utils/log";

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userApprove = JSON.parse(localStorage.getItem("user"));
  const roleApprove = userApprove?.role || "";
  const canApprove = roleApprove === "admin";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServeModal, setShowServeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/order/id/${id}`);
      debug(res.data)
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const result = await showConfirmSwal({
      title: "Approve Order?",
      text: "This will approve the sales order.",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmColor: "green",
    });
  
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.post(`${API_URL}/order/id/${order.id}/approve`);
      showSuccessSwal("Order Approved", "The sales order has been approved successfully." );
      await fetchOrder();
    } catch (err) {
      console.error(err);
      showErrorSwal("Approval Failed", err.response?.data?.message || "Failed to approve the sales order." );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const result = await showConfirmSwal({
      title: "Reject Order?",
      text: "This will reject the sales order.",
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      confirmColor: "red",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      setLoading(true);
  
      await axios.post(`${API_URL}/order/id/${order.id}/reject`);
  
      await showSuccessSwal({
        title: "Order Rejected",
        text: "The sales order has been rejected successfully.",
      });
  
      fetchOrder();
    } catch (err) {
      console.error(err);
  
      showErrorSwal({
        title: "Rejection Failed",
        text:
          err.response?.data?.message ||
          "Failed to reject the sales order.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnserve = async () => {
    const result = await showConfirmSwal({
      title: "Unserve Order?",
      text: "This will restore inventory and reset all served quantities.",
      confirmButtonText: "Yes, Unserve",
      cancelButtonText: "Cancel",
      confirmColor: "red",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      await axios.post(`${API_URL}/order/id/${order.id}/unserve`);
      showSuccessSwal("Order has been unserved.");
      await fetchOrder();
    } catch (err) {
      console.error(err);
      showErrorSwal(err.response?.data?.message || "Failed to unserve order." );
    }
  };

  const handleInvoice = async () => {
    const result = await showConfirmSwal({
      title: "Proceed to Invoice?",
      html: `
        <div class="post-warning">
          <p>This will:</p>
          <ul>
            <li>Create a Sales Invoice from this order</li>
            <li>Mark the order as <strong>INVOICED</strong></li>
          </ul>
        </div>
      `,
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      confirmColor: "green",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      await axios.post(`${API_URL}/order/id/${order.id}/invoice`);
  
      showSuccessSwal("Sales invoice created successfully.");
  
      await fetchOrder(); // Refresh details page
  
      // Optional: navigate to the invoice details page if your API returns it
      // const res = await axios.post(...);
      // navigate(`/sales-invoice/${res.data.id}`);
    } catch (err) {
      console.error(err);
      showErrorSwal(err.response?.data?.message || "Failed to create sales invoice.");
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  const items = order?.items || [];

  const computedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty =
        order?.status !== "Open"
          ? Number(item.serve_qty || 0)
          : Number(item.quantity || 0);

      return sum + price * qty;
    }, 0);
  }, [items, order?.status]);

  const getStatusClass = (status) => {
    const key = status?.trim().toLowerCase();
    debug(key)

    if (key === "served") return "success";
    if (key === "open") return "pending";
    if (key === "partial served") return "partial-served";
    if (key === "rejected" || key === "cancelled" || key === "for approval") return "danger";
    if (key === "invoiced") return "invoiced";
    if (key === "partial invoiced") return "purple";
    return "pending";
  };

  const initials = order?.customer?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return <div className="details-page">Loading order...</div>;
  }

  if (!order) {
    return <div className="details-page">Order not found.</div>;
  }

  const isServed = order.status === "Served" || order.status === "Partial Served";
  const isApprove = order.status === "For Approval";
  debug(isServed, isApprove)

  return (
    <div className="details-page">
      <div className="details-page-header">
        <div>
          <div className="d-flex align-items-center gap-3">
            <div className="details-page-title">
              ORD{String(order.id).padStart(4, "0")}
            </div>
            <span className={`details-status-badge ${getStatusClass(order.status)}`}>
              {debug(getStatusClass(order.status))}
              {order.status || "Unknown"}
            </span>
          </div>

          <div className="details-page-subtitle">Sales Order Details</div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn-primary-custom"
            onClick={() => setShowEditModal(true)}
            disabled={order.status !== "Open"}
          >
            Edit
          </button>
          <button
            type="button"
            className={
              isServed ? "btn-danger-custom" : "btn-tertiary-custom"
            }
            disabled={(isApprove && !canApprove) || order.status === "Invoiced" || order.status === "Partial Invoiced"}
            onClick={
              isApprove
                ? canApprove
                  ? handleApprove
                  : undefined
                : isServed
                ? handleUnserve
                : () => setShowServeModal(true)
            }
          >
            {
              isApprove
                ? "Approve"
                : isServed
                ? "Unserve"
                : "Serve"
            }
          </button>
          { isApprove && (
            <button
              type="button"
              className="btn-danger-custom"
              onClick={handleReject}
              disabled={(!canApprove)}
            >
              Reject
            </button>
          )}
          <button
            type="button"
            className={
              isServed ? "btn-tertiary-custom" : "btn-secondary-custom"
            }
            onClick={handleInvoice}
            disabled={!(order.status === "Served" || order.status === "Partial Served")}
          >
            Proceed to Invoice
          </button>
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
          <div className="details-card-label">Customer</div>

          <div className="details-entity-name">
            <span className="details-avatar">{initials || "—"}</span>
            <span>{order.customer?.name || "—"}</span>
          </div>
        </div>

        <div className="details-info-card">
          <div className="details-card-label">Address</div>
          <div className="details-card-value">{order.customer?.address || "—"}</div>
        </div>

        <div className="details-info-card">
          <div className="details-card-label">Contact Number</div>
          <div className="details-card-value mono">
            {order.customer?.number || "—"}
          </div>
        </div>
        
        <div className="details-info-card">
          <div className="details-card-label">Order Date</div>
          <div className="details-card-value">
            {order.order_date
              ? new Date(order.order_date).toLocaleDateString("en-PH")
              : "—"}
          </div>
        </div>

        <div className="details-info-card">
          <div className="details-card-label">PIC</div>
          <div className="details-card-value">{order.sales_agent?.name || "—"}</div>
        </div>
      </div>

      <div className="details-table-card">
        <div className="details-table-header">
          <div className="details-table-title">Order Items</div>
          <div className="details-item-count">{items.length} item(s)</div>
        </div>

        <table className="details-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Served</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const price = Number(item.price || 0);
              const qty =
                order.status !== "Open"
                  ? Number(item.serve_qty || 0)
                  : Number(item.quantity || 0);

              return (
                <tr
                  key={item.id}
                  className="details-clickable-row"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowCostModal(true);
                  }}
                >
                  <td>
                    <div className="item-click-wrap">
                      <span className="item-name-link">
                        {item.products?.item_name || "—"}
                      </span>
                      <small className="item-code-muted">
                        {item.products?.item_code || ""}
                      </small>
                    </div>
                  </td>
                  <td className="details-num">{item.quantity || 0}</td>
                  <td className="details-num">{item.serve_qty || 0}</td>
                  <td className="details-num">{formatCurrency(price)}</td>
                  <td className="details-subtotal">{formatCurrency(price * qty)}</td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan="4">
                <div className="details-total-label">Total</div>
              </td>
              <td className="details-total-value">
                {formatCurrency(computedTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showCostModal && (
        <Modal
          show={showCostModal}
          onHide={() => setShowCostModal(false)}
          size="xl"
          centered
          dialogClassName="cost-history-modal"
        >
          <Modal.Header closeButton className="cost-history-header">
            <div>
              <Modal.Title className="cost-history-title">
                Cost History
              </Modal.Title>
              <div className="cost-history-subtitle">
                {selectedItem?.products?.item_name}
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="cost-history-body">
            {selectedItem && <CostHistoryTab item={selectedItem.products} />}
          </Modal.Body>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditOrderModal
          order={order}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchOrder();
          }}
        />
      )}

      {/* SERVE MODAL */}
      {showServeModal && (
        <ServeOrderModal
          order={order}
          roleApprove={roleApprove}
          onClose={() => setShowServeModal(false)}
          onSuccess={() => {
            setShowServeModal(false);
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}