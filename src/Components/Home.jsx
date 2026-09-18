import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LuPackage, LuUsers, LuTruck, LuClipboardList, LuArrowRight, } from "react-icons/lu";
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
    </div>
  );
}