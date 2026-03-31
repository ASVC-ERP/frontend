import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [latestOrders, setLatestOrders] = useState([]);
  const [latestInvoices, setLatestInvoices] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [pcountRes, scountRes, ocountRes, ccountRes] = await Promise.all([
          axios.get(`${API_URL}/product/count`),
          axios.get(`${API_URL}/supplier/count`),
          axios.get(`${API_URL}/order/count`),
          axios.get(`${API_URL}/customer/count`),
        ]);

        // Adjust according to your backend response
        // e.g., if backend returns { count: 42 }
        setTotalItems(pcountRes.data.count ?? pcountRes.data);
        setTotalSuppliers(scountRes.data.count ?? scountRes.data);
        setTotalOrders(ocountRes.data.count ?? ocountRes.data)
        setTotalCustomers(ccountRes.data.count ?? ccountRes.data)

      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const [ oRes, iRes ] = await Promise.all ([
          axios.get(`${API_URL}/order/latest`),
          axios.get(`${API_URL}/invoice/latest`)
        ]);
        setLatestOrders(oRes.data);
        setLatestInvoices(iRes.data)
      } catch (err) {
        console.error("Failed to fetch latest:", err);
      }
    };

    fetchLatest();
  }, []);

  const StatCard = ({ title, value, colorClass }) => (
    <div className="col-md-3">
      <div className={`card shadow-sm border-0 p-3 ${colorClass}`}>
        <h6>{title}</h6>
        <h3>{value}</h3>
      </div>
    </div>
  );

  const quickActions = [
    { label: "View Inventory", route: "/inventory", className: "btn-primary" },
    { label: "Create Order", route: "/create-order", className: "btn-success" },
    { label: "Manage Suppliers", route: "/supplier", className: "btn-warning" },
    { label: "View Invoices", route: "/invoice", className: "btn-dark" },
  ];

  return (
    <div className="p-4" style={{ background: "#f6f7fb", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <h3 style={{ fontWeight: "710", color: "#1E5A84" }}>Dashboard</h3>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <StatCard title="Open Orders" value={loading ? "..." : totalOrders} />
        <StatCard title="Total Items" value={loading ? "..." : totalItems} />
        <StatCard title="Customers" value={loading ? "..." : totalCustomers} />
        <StatCard title="Suppliers" value={loading ? "..." : totalSuppliers} />
      </div>

      {/* Quick Actions */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <h5 className="mb-3">Quick Actions</h5>

        <div className="d-flex gap-3 flex-wrap">
          {quickActions.map((action) => (
            <button
              key={action.route}
              className={`btn ${action.className}`}
              onClick={() => navigate(action.route)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Latest Open Orders */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <h5 className="mb-3">Latest Open Orders</h5>
        {latestOrders.length === 0 ? (
          <p style={{ color: "#6c757d" }}>No open orders.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {latestOrders.map((order) => (
              <li
                key={order.id}
                className="list-group-item d-flex flex-column gap-1"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/order`)}
              >
                <div className="d-flex justify-content-between">
                  <span><strong>Order #{order.id}</strong></span>
                  <span className="badge bg-success">{order.status}</span>
                </div>

                <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.9rem" }}>
                  <span>Customer: {order.customers.name}</span>
                  <span>Total: ₱{order.total_price.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Latest Invoices */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <h5 className="mb-3">Latest Open Invoices</h5>
        {latestInvoices.length === 0 ? (
          <p style={{ color: "#6c757d" }}>No invoices.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {latestInvoices.map((invoice) => (
              <li
                key={invoice.id}
                className="list-group-item d-flex flex-column gap-1"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/invoice`)}
              >
                <div className="d-flex justify-content-between">
                  <span><strong>Invoice #{invoice.id}</strong></span>
                  <span>Customer: {invoice.customers.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}