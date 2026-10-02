import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LuPackage, LuUsers, LuTruck, LuClipboardList, LuArrowRight, } from "react-icons/lu";
import { showErrorSwal } from "../utils/swal";
import "../styles/dashboard.css";
import { getUser } from "../api/http";

export default function HomePage() {
  const navigate = useNavigate();
  const user = getUser(); // from the signed access token
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Zero-stock products with no sale/purchase in 90 days -- the clearest
  // candidates for marking inactive, since Slow-Moving/Sales Report only
  // ever look at items still in stock.
  const [dormant, setDormant] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/product/dormant`, { params: { stock: "out" } })
      .then((res) => setDormant(res.data || []))
      .catch(() => setDormant([]));
  }, [API_URL]);

  const toggleStatus = async (productId, nextStatus) => {
    setTogglingId(productId);
    try {
      await axios.patch(`${API_URL}/product/${productId}/status`, { status: nextStatus });
      setDormant((prev) =>
        prev.map((r) => (r.product_id === productId ? { ...r, status: nextStatus } : r)),
      );
    } catch (e) {
      showErrorSwal("Update failed", e.response?.data?.message || "Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [pcountRes, scountRes, ocountRes, ccountRes] =
          await Promise.all([
            axios.get(`${API_URL}/product/count`),
            axios.get(`${API_URL}/supplier/count`),
            axios.get(`${API_URL}/order/count`),
            axios.get(`${API_URL}/customer/count`),
          ]);

        setTotalItems(pcountRes.data.count ?? pcountRes.data);
        setTotalSuppliers(scountRes.data.count ?? scountRes.data);
        setTotalOrders(ocountRes.data.count ?? ocountRes.data);
        setTotalCustomers(ccountRes.data.count ?? ccountRes.data);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [API_URL]);

  const StatCard = ({ title, value, icon: Icon, tone }) => (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`dashboard-stat-card ${tone}`}>
        <div className="dashboard-stat-icon">
          <Icon size={24} />
        </div>

        <div>
          <p>{title}</p>
          <h3>{loading ? "..." : value}</h3>
        </div>
      </div>
    </div>
  );

  const quickActions = [
    { label: "Create Order", route: "/create-order" },
    { label: "Create Purchase", route: "create-purchase" },
    { label: "Manage Suppliers", route: "/suppliers" },
    { label: "Manage Customers", route: "/customer" },
    { label: "View Orders", route: "/order" },
    { label: "View Invoices", route: "/invoice" },
    { label: "View Products", route: "/products" },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
      <div>
        <p className="dashboard-eyebrow">Dashboard</p>
        <h1>Welcome back, {user?.name}!</h1>
        <span>Here's what's happening across your inventory and sales today.</span>
      </div>
      </div>

      <div className="row g-3 dashboard-stats">
        <StatCard
          title="Open Orders"
          value={totalOrders}
          icon={LuClipboardList}
          tone="blue"
        />
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={LuPackage}
          tone="green"
        />
        <StatCard
          title="Customers"
          value={totalCustomers}
          icon={LuUsers}
          tone="purple"
        />
        <StatCard
          title="Suppliers"
          value={totalSuppliers}
          icon={LuTruck}
          tone="orange"
        />
      </div>

      <div className="dashboard-card dashboard-actions-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>Jump directly to commonly used pages.</p>
          </div>
        </div>

        <div className="dashboard-actions">
          {quickActions.map((action) => {
            return (
              <button
                key={action.route}
                className="dashboard-action-btn"
                onClick={() => navigate(action.route)}
              >
                <span>
                  {action.label}
                </span>
                <LuArrowRight size={18} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-section-header">
          <div>
            <h2>No Recent Activity (Out of Stock)</h2>
            <p>Zero-stock products with no sale or purchase in 90 days.</p>
          </div>
          {dormant.length > 0 && (
            <button
              type="button"
              className="btn-secondary-custom"
              onClick={() => navigate("/products/no-activity?stock=out")}
            >
              View all
            </button>
          )}
        </div>

        {dormant.length === 0 ? (
          <div className="dashboard-empty">Nothing dormant out of stock. 🎉</div>
        ) : (
          <div className="dashboard-list compact">
            {dormant.slice(0, 5).map((it) => (
              <div className="dashboard-list-item" style={{ cursor: "default" }} key={it.product_id}>
                <div>
                  <h4>{it.description || `Product ${it.product_id}`}</h4>
                  <p>
                    {it.days_ago == null
                      ? "No sales or purchases yet."
                      : `No activity in ${it.days_ago} day${it.days_ago === 1 ? "" : "s"}.`}
                  </p>
                </div>

                <div className="dashboard-list-right">
                  <span
                    className={`dashboard-badge ${it.status === "inactive" ? "danger" : "success"}`}
                  >
                    {it.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary-custom"
                    style={{ minWidth: 0, height: 28, padding: "0 10px", fontSize: 12 }}
                    disabled={togglingId === it.product_id}
                    onClick={() =>
                      toggleStatus(it.product_id, it.status === "inactive" ? "active" : "inactive")
                    }
                  >
                    {togglingId === it.product_id
                      ? "…"
                      : it.status === "inactive"
                        ? "Mark Active"
                        : "Mark Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}