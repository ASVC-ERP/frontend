import { LiaUserCircle } from "react-icons/lia";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BsPersonGear } from "react-icons/bs";
import { PiGearSixBold, PiShoppingBagBold } from "react-icons/pi";
import { TbTruckDelivery, TbTruckReturn, TbReportAnalytics, TbShoppingCart } from "react-icons/tb";
import { RiReceiptLine } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiUsers } from "react-icons/fi";

import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import "./Sidebar.css";

// `user` comes from App (useAuth -> the signed access token). Role gating
// below is cosmetic; the backend enforces @Roles on every admin route.
export default function Sidebar({ user, onLogout }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const linkStyle = {
    color: "#1E5A84",
    fontSize: "1.1rem",
    cursor: "pointer",
    textDecoration: "none",
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
 
  return (
    <div className={`sidebar-container d-flex flex-column ${isCollapsed ? "collapsed" : ""}`}>
      {/* Logo and Company Name */}
      <div className="logo-container">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation Links */}      
      <div className="sidebar">

      <ul className="sidebar-group">
          <li className="mt-2">
            <Link to="/" className="nav-link d-flex align-items-center" style={linkStyle}>
              <LuLayoutDashboard className="me-3" size={25} />
              <span className="sidebar-text">Dashboard</span>
            </Link>
          </li>
        </ul>

        {/* ANALYTICS — admin only */}
        {user?.role === "admin" && (
          <>
            <p className="sidebar-header">ANALYTICS</p>
            <ul className="sidebar-group">
              <li className="mt-2">
                <Link to="/reports/sales" className="nav-link d-flex align-items-center" style={linkStyle}>
                  <TbReportAnalytics className="me-3" size={25} />
                  <span className="sidebar-text">Sales</span>
                </Link>
              </li>
              <li className="mt-2">
                <Link to="/reports/purchases" className="nav-link d-flex align-items-center" style={linkStyle}>
                  <TbShoppingCart className="me-3" size={25} />
                  <span className="sidebar-text">Purchase</span>
                </Link>
              </li>
            </ul>
          </>
        )}

        {/* SALES */}
        <p className="sidebar-header">SALES</p>
        <ul className="sidebar-group">
          <li className="mt-2">
            <Link to="/order" className="nav-link d-flex align-items-center" style={linkStyle}>
              <PiShoppingBagBold className="me-3" size={25} />
              <span className="sidebar-text">Orders</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link to="/invoices" className="nav-link d-flex align-items-center" style={linkStyle}>
              <RiReceiptLine className="me-3" size={25} />
              <span className="sidebar-text">Invoices</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link to="/invoice-return" className="nav-link d-flex align-items-center" style={linkStyle}>
              <HiOutlineReceiptRefund className="me-3" size={25} />
              <span className="sidebar-text">S. Returns</span>
            </Link>
          </li>
        </ul>

        {/* INVENTORY */}
        <p className="sidebar-header">INVENTORY</p>
        <ul className="sidebar-group">
          <li className="mt-2">
            <Link to="/products" className="nav-link d-flex align-items-center" style={linkStyle}>
              <PiGearSixBold className="me-3" size={25} />
              <span className="sidebar-text">Products</span>
            </Link>
          </li>
        </ul>

        {/* PROCUREMENT */}
        <p className="sidebar-header">PROCUREMENT</p>
        <ul className="sidebar-group">
          <li className="mt-2">
            <Link to="/purchase" className="nav-link d-flex align-items-center" style={linkStyle}>
              <TbTruckDelivery className="me-3" size={25} />
              <span className="sidebar-text">Purchases</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link to="/purchase-return" className="nav-link d-flex align-items-center" style={linkStyle}>
              <TbTruckReturn className="me-3" size={25} />
              <span className="sidebar-text">P. Returns</span>
            </Link>
          </li>
        </ul>

        {/* ADMIN */}
        <p className="sidebar-header">MASTER DATA</p>
        <ul className="sidebar-group">
          <li className="mt-2">
            <Link to="/suppliers" className="nav-link d-flex align-items-center" style={linkStyle}>
              <BsPersonGear className="me-3" size={25} />
              <span className="sidebar-text">Suppliers</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link to="/customer" className="nav-link d-flex align-items-center" style={linkStyle}>
              <MdOutlinePeopleAlt className="me-3" size={25} />
              <span className="sidebar-text">Customers</span>
            </Link>
          </li>
        </ul>

        {user?.role === "admin" && (
          <>
            <p className="sidebar-header">ADMIN</p>
            <ul className="sidebar-group">
              <li className="mt-2">
                <Link to="/users" className="nav-link d-flex align-items-center" style={linkStyle}>
                  <FiUsers className="me-3" size={25} />
                  <span className="sidebar-text">Users</span>
                </Link>
              </li>
            </ul>
          </>
        )}

      </div>

      {/* Profile Section at the Bottom */}
      <div className="profile-section d-flex align-items-center justify-content-center mb-4 mt-auto">
        <div className="dropdown">
          <button
            className="btn p-0 border-0 bg-transparent d-flex align-items-center"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="profileDropdown"
          >
            <LiaUserCircle size={35} color="#1E5A84" />
            <p
              className="h6 fw-bolder ms-3 sidebar-text mb-0"
              style={{ color: "#1E5A84" }}
            >
              {user?.name}
            </p>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="profileDropdown"
          >
            <li>
              <button
                className="dropdown-item"
                href="#profile"
                data-bs-toggle="modal"
                data-bs-target="#profileModal"
              >
                <i className="bi bi-person me-2"></i>
                Profile
              </button>
            </li>
            <li>
              <Link className="dropdown-item" to="/change-password">
                <i className="bi bi-key me-2"></i>
                Change password
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
