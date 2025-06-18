import DataTable from "react-data-table-component";
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";

function InvoiceTable() {
  const salesInvoices = [
    {
      invoiceId: "SI-001",
      date: "2025-06-15",
      customerName: "Juan Dela Cruz",
      customerAddress: "123 Rizal St., Manila",
      customerNumber: "09171234567",
      items: [
        {
          itemName: "Red T-Shirt",
          quantity: 2,
          unitPrice: 250.0,
          grossPrice: 500.0,
          discount: 50.0,
          netPrice: 450.0,
        },
        {
          itemName: "Blue Jeans",
          quantity: 1,
          unitPrice: 800.0,
          grossPrice: 800.0,
          discount: 0.0,
          netPrice: 800.0,
        },
      ],
      totalGross: 1300.0,
      totalDiscount: 50.0,
      totalNet: 1250.0,
      salesAgent: "Ana Lopez",
      status: "Paid",
    },
    {
      invoiceId: "SI-002",
      date: "2025-06-16",
      customerName: "Maria Santos",
      customerAddress: "456 Mabini St., Quezon City",
      customerNumber: "09181234567",
      items: [
        {
          itemName: "White Sneakers",
          quantity: 1,
          unitPrice: 1500.0,
          grossPrice: 1500.0,
          discount: 100.0,
          netPrice: 1400.0,
        },
      ],
      totalGross: 1500.0,
      totalDiscount: 100.0,
      totalNet: 1400.0,
      salesAgent: "Mark Reyes",
      status: "Pending",
    },
    {
      invoiceId: "SI-003",
      date: "2025-06-17",
      customerName: "Pedro Mendoza",
      customerAddress: "789 Bonifacio Ave., Pasig",
      customerNumber: "09191234567",
      items: [
        {
          itemName: "Black Hoodie",
          quantity: 1,
          unitPrice: 1200.0,
          grossPrice: 1200.0,
          discount: 0.0,
          netPrice: 1200.0,
        },
        {
          itemName: "Cap",
          quantity: 2,
          unitPrice: 200.0,
          grossPrice: 400.0,
          discount: 40.0,
          netPrice: 360.0,
        },
      ],
      totalGross: 1600.0,
      totalDiscount: 40.0,
      totalNet: 1560.0,
      salesAgent: "Ana Lopez",
      status: "Paid",
    },
  ];

  const columns = [
    {
      name: "Invoice ID",
      selector: (row) => row.invoiceId,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "No. of Items",
      selector: (row) => row.items.length,
      sortable: true,
      center: true,
    },
    {
      name: "Gross Price",
      selector: (row) =>
        `₱${row.totalGross.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
      sortable: true,
      right: true,
    },
    {
      name: "Discount",
      selector: (row) =>
        `₱${row.totalDiscount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
      sortable: true,
      right: true,
    },
    {
      name: "Net Price",
      selector: (row) =>
        `₱${row.totalNet.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
      sortable: true,
      right: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Paid"
              ? "bg-success"
              : row.status === "Pending"
              ? "bg-warning text-dark"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(salesInvoices);

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(salesInvoices).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        {/* Search input field */}
        <div className="position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search inventory"
            value={searchTerm}
            onChange={handleSearch}
            className="form-control ps-5 border-2 rounded-3"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="500px"
        className="custom-data-table"
      />
    </div>
  );
}

export default InvoiceTable;
