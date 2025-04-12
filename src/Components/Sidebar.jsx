import { useState } from "react";
import { BsBasketFill , BsBoxSeamFill , BsPersonCircle } from "react-icons/bs";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import { FaCashRegister } from "react-icons/fa6";
import { IoReceipt } from "react-icons/io5";



import logo from "../assets/logo.png"

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);


  return (
    <div className="d-flex flex-column vh-100 position-sticky">
        {/* Logo and Company Name */}
        <div className="d-flex align-items-center mb-3">
            <img src={logo} alt="Logo" className="m-0 p-0" style={{ height: "75px", width: "75px" }} />
            <p className="fw-bolder fs-5 m-0 p-0" style={{ color: "#0C1D61" }}>Company Name</p>
        </div>

        {/* Navigation Links */}
        <div className="d-flex flex-column flex-grow-1 ">
            <ul className="nav flex-column">
                <li className="nav-item mt-3">
                    {/* Sales Button */}
                    <a
                        href="#" className="nav-link d-flex align-items-center" style={{ color: "#0C1D61", fontSize: "1.2rem", cursor: "pointer" }}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <BsBasketFill className="me-3" size={30} /> Sales
                    </a>

                    {/* Dropdown Items */}
                    {isOpen && (
                        <ul className="list-unstyled ms-4 mt-2">
                        <li>
                            <a href="#" className="nav-link" style={{ color: "#0C1D61", fontSize: "1.2rem" }}>
                            <FaCashRegister className="me-3" size={20} /> Orders
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link" style={{ color: "#0C1D61", fontSize: "1.2rem" }}>
                            <IoReceipt className="me-3" size={20} /> Invoice
                            </a>
                        </li>
                        </ul>
                    )}
                </li>
                <li className="nav-item mt-3">
                    <a href="#" className="nav-link d-flex align-items-center" style={{ color: "#0C1D61", fontSize: "1.2rem" }}>
                        <BsBoxSeamFill className="me-3" size={30} /> Inventory
                    </a>
                </li>
                <li className="nav-item mt-3">
                    <a href="#" className="nav-link d-flex align-items-center" style={{ color: "#0C1D61", fontSize: "1.2rem" }}>
                        <FaFileInvoiceDollar className="me-3" size={30} /> Accounting
                    </a>
                </li>
                <li className="nav-item mt-3">
                    <a href="#" className="nav-link d-flex align-items-center" style={{ color: "#0C1D61", fontSize: "1.2rem" }}>
                        <HiDocumentReport className="me-3" size={30} /> Report
                    </a>
                </li>
            </ul>
        </div>

        {/* Profile Section at the Bottom */}
        <div className="d-flex align-items-center ms-4 mb-4 mt-auto">
            <p className="h5 fw-bolder me-3" style={{ color: "#0C1D61" }}>Hi, Prince 兄!</p>
            <BsPersonCircle size={30} color="#0C1D61" />
        </div>
    </div>

  );
}
