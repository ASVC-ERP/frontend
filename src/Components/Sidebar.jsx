import { useState } from "react";
import { BsBasketFill, BsBoxSeamFill, BsPersonCircle } from "react-icons/bs";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import { FaCashRegister } from "react-icons/fa6";
import { IoReceipt } from "react-icons/io5";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

import logo from "../assets/logo.png";

export default function Sidebar({ collapsed }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="d-flex flex-column vh-100 position-sticky"
      style={{
        width: collapsed ? "60px" : "250px",
        transition: "width 0.3s ease",
        overflow: "hidden",
        backgroundColor: "#E8E7EC",
      }}
    >
      {/* Logo and Company Name */}
      <div className="d-flex align-items-center mb-3 px-3">
        <img
          src={logo}
          alt="Logo"
          className="m-0 p-0"
          style={{ height: "50px", width: "50px" }}
        />
        <p
          className={`fw-bolder fs-5 m-0 p-0 sidebar-text ${
            collapsed ? "d-none" : ""
          }`}
          style={{ color: "#0C1D61", whiteSpace: "nowrap" }}
        >
          Company Name
        </p>
      </div>

      {/* Navigation Links */}
      <div className="d-flex flex-column flex-grow-1">
        <ul className="nav flex-column">
          <li className="nav-item mt-3">
            <a
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              <BsBasketFill className="me-3" size={30} />
              <span className={`sidebar-text ${collapsed ? "d-none" : ""}`}>
                Sales
              </span>
            </a>
            {/* Dropdown Items - Only show if sidebar is not collapsed */}
            {isOpen && (
              <ul className="list-unstyled ms-4 mt-2">
                <li>
                  <Link
                    to="/"
                    className="nav-link"
                    style={{
                      color: "#0C1D61",
                      fontSize: "1.2rem",
                      textDecoration: "none",
                    }}
                  >
                    <FaCashRegister className="me-3" size={20} />
                    <span
                      className={`sidebar-text ${collapsed ? "d-none" : ""}`}
                    >
                      Orders
                    </span>
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="nav-link"
                    style={{ color: "#0C1D61", fontSize: "1.2rem" }}
                  >
                    <IoReceipt className="me-3" size={20} />
                    <span
                      className={`sidebar-text ${collapsed ? "d-none" : ""}`}
                    >
                      Invoice
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </li>
          <li className="nav-item mt-3">
            <Link
              to="/inventory"
              className="nav-link d-flex align-items-center"
              style={{
                color: "#0C1D61",
                fontSize: "1.2rem",
                textDecoration: "none",
              }}
            >
              <BsBoxSeamFill className="me-3" size={30} />
              <span className={`sidebar-text ${collapsed ? "d-none" : ""}`}>
                Inventory
              </span>
            </Link>
          </li>
          <li className="nav-item mt-3">
            <a
              href="#"
              className="nav-link d-flex align-items-center"
              style={{ color: "#0C1D61", fontSize: "1.2rem" }}
            >
              <FaFileInvoiceDollar className="me-3" size={30} />
              <span className={`sidebar-text ${collapsed ? "d-none" : ""}`}>
                Accounting
              </span>
            </a>
          </li>
          <li className="nav-item mt-3">
            <a
              href="#"
              className="nav-link d-flex align-items-center"
              style={{ color: "#0C1D61", fontSize: "1.2rem" }}
            >
              <HiDocumentReport className="me-3" size={30} />
              <span className={`sidebar-text ${collapsed ? "d-none" : ""}`}>
                Report
              </span>
            </a>
          </li>
        </ul>
      </div>

      {/* Profile Section at the Bottom */}
      <div className="d-flex align-items-center justify-content-center mb-4 mt-auto">
        <BsPersonCircle size={30} color="#0C1D61" />
        <p
          className={`h5 fw-bolder ms-3 sidebar-text ${
            collapsed ? "d-none" : ""
          }`}
          style={{ color: "#0C1D61" }}
        >
          Hi, Prince 兄!
        </p>
      </div>
    </div>
  );
}
