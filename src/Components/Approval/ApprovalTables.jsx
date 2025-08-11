import { useState } from "react";
import DataTable from "react-data-table-component";
import { Check, X } from "lucide-react";
import { IoIosSearch } from "react-icons/io";

function ApprovalTables() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [supplierInvoice, setSupplierInvoice] = useState([
    {
      id: 1,
      supplierName: "Tech Solutions",
      invoiceNo: "INV-001",
      status: "Pending",
    },
    {
      id: 2,
      supplierName: "Office Supplies",
      invoiceNo: "INV-002",
      status: "Approved",
    },
    {
      id: 3,
      supplierName: "Marketing Ltd.",
      invoiceNo: "INV-003",
      status: "Rejected",
    },
    {
      id: 4,
      supplierName: "Cloud Pro",
      invoiceNo: "INV-004",
      status: "Pending",
    },
    {
      id: 5,
      supplierName: "Legal Team",
      invoiceNo: "INV-005",
      status: "Pending",
    },
  ]);

  const filteredByStatus = supplierInvoice.filter(
    (inv) => inv.status === activeTab
  );
  
  const filteredData = filteredByStatus.filter((row) =>
    Object.values(row).some((field) =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectRow = (row) => {
    const updated = selectedInvoices.includes(row.id)
      ? selectedInvoices.filter((id) => id !== row.id)
      : [...selectedInvoices, row.id];
    setSelectedInvoices(updated);
  };

  const handleSelectAll = (isChecked) => {
    const filteredIds = filteredByStatus.map((row) => row.id);
    setSelectedInvoices(isChecked ? filteredIds : []);
  };

  const handleApprove = () => {
    setSupplierInvoice((prev) =>
      prev.map((inv) =>
        selectedInvoices.includes(inv.id) ? { ...inv, status: "Approved" } : inv
      )
    );
    setSelectedInvoices([]);
  };

  const handleReject = () => {
    setSupplierInvoice((prev) =>
      prev.map((inv) =>
        selectedInvoices.includes(inv.id) ? { ...inv, status: "Rejected" } : inv
      )
    );
    setSelectedInvoices([]);
  };

  const columns = [
    {
      name:
        activeTab === "Pending" ? (
          <input
            type="checkbox"
            onChange={(e) => handleSelectAll(e.target.checked)}
            checked={
              filteredByStatus.length > 0 &&
              filteredByStatus.every((inv) => selectedInvoices.includes(inv.id))
            }
          />
        ) : null,
      cell: (row) =>
        activeTab === "Pending" ? (
          <input
            type="checkbox"
            checked={selectedInvoices.includes(row.id)}
            onChange={() => handleSelectRow(row)}
          />
        ) : null,
      ignoreRowClick: true,
      width: "60px",
    },
    {
      name: "Supplier Name",
      selector: (row) => row.supplierName,
      sortable: true,
    },
    {
      name: "Invoice No",
      selector: (row) => row.invoiceNo,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Pending"
              ? "bg-warning text-dark"
              : row.status === "Approved"
              ? "bg-success"
              : row.status === "Rejected"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="nav nav-tabs my-3">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`nav-link ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm("");
              setSelectedInvoices([]);
            }}
            style={{
              backgroundColor: activeTab === tab ? "#0C1D61" : "#ffffff",
              color: activeTab === tab ? "white" : "#0C1D61",
              border: activeTab === tab ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3 position-relative w-25">
        <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
        <input
          type="text"
          placeholder="Search"
          className="form-control ps-5"
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
            disabled={selectedInvoices.length === 0}
          >
            <Check size={16} /> Approve
          </button>
          <button
            onClick={handleReject}
            className="btn btn-danger"
            disabled={selectedInvoices.length === 0}
          >
            <X size={16} /> Reject
          </button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        className="custom-data-table"
        pagination
        noHeader
        highlightOnHover
        responsive
        fixedHeader
        fixedHeaderScrollHeight="400px"
      />
    </div>
  );
}

export default ApprovalTables;
