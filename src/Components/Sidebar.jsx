import { BsBasketFill , BsBoxSeamFill , BsBoxArrowRight } from "react-icons/bs";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";


import logo from "../assets/logo.png"

export default function Sidebar() {
  return (
    <div className="d-flex flex-column p-3 vh-100 ">

        <div className="d-flex align-items-center mb-3">
            <img src={logo} alt="Logo" style={{ height: "75px", width: "75px" }} />
            <p className="fw-bolder fs-6 ms-3 mb-0" style={{ color: "#0C1D61" }}>Company Name</p>
        </div>
        
        <ul className="nav flex-column">
            <li className="nav-item mt-3">
                <a href="#" className="nav-link d-flex align-items-center" style={{ color: "#0C1D61", fontSize: "1.2rem" }}>
                    <BsBasketFill className="me-3" size={30} /> Sales
                </a>
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
  );
}
