import { BsBoxSeamFill, BsPersonCircle } from "react-icons/bs";
import { FaCashRegister } from "react-icons/fa6";
import { IoReceipt } from "react-icons/io5";
import { FaTruck, FaUser } from "react-icons/fa";
import { PiListChecksFill } from "react-icons/pi";

import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Sidebar({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      className="d-flex flex-column vh-100 position-sticky"
      style={{
        width: "200px",
        overflow: "hidden",
        backgroundColor: "#E8E7EC",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Logo and Company Name */}
      <div className="d-flex flex-column align-items-center mb-3 px-3">
        <img
          src={logo}
          alt="Logo"
          className="m-0 p-0 mt-2"
          style={{ height: "150px", width: "150px" }}
        />
      </div>

      {/* Navigation Links */}
      <div className="d-flex flex-column flex-grow-1">
        <ul className="nav flex-column list-unstyled ms-4 mt-2">

          {/* Approval - Only show for Admin */}
          {user?.role === "admin" && (
            <li className="mt-2">
              <Link
                to="/approval"
                className="nav-link d-flex align-items-center"
                style={{
                  color: "#0C1D61",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                <PiListChecksFill className="me-3" size={30} />
                <span className="sidebar-text">Approval</span>
              </Link>
            </li>
          )}

          <li className="mt-2">
            <Link
              to="/"
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <FaCashRegister className="me-3" size={30} />
              <span className="sidebar-text">Order</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link
              to="/invoice"
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <IoReceipt className="me-3" size={30} />
              <span className="sidebar-text">Sales Invoice</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link
              to="/inventory"
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <BsBoxSeamFill className="me-3" size={30} />
              <span className="sidebar-text">Inventory</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link
              to="/supplier"
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <FaTruck className="me-3" size={30} />
              <span className="sidebar-text">Supplier</span>
            </Link>
          </li>

          <li className="mt-2">
            <Link
              to="/customer"
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <FaUser className="me-3" size={30} />
              <span className="sidebar-text">Customer</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Profile Section at the Bottom */}
      <div className="d-flex align-items-center justify-content-center mb-4 mt-auto">
        <div className="dropdown">
          <button
            className="btn p-0 border-0 bg-transparent d-flex align-items-center"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="profileDropdown"
          >
            <BsPersonCircle size={30} color="#0C1D61" />
            <p
              className="h5 fw-bolder ms-3 sidebar-text mb-0"
              style={{ color: "#0C1D61" }}
            >
              Hi, {user.firstName} 兄!
            </p>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="profileDropdown"
          >
            <li>
              <a
                className="dropdown-item"
                href="#profile"
                data-bs-toggle="modal"
                data-bs-target="#profileModal"
              >
                <i className="bi bi-person me-2"></i>
                Profile
              </a>
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
