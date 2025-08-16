import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";

function InvoiceTable({ invoices }) {
  const columns = [
    {
      name: "Invoice ID",
      selector: (row) => row.invoiceID,
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
      selector: (row) => row.numItems,
      sortable: true,
      center: true,
    },
    {
      name: "Gross Price",
      selector: (row) =>
        `₱${row.grossPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
      sortable: true,
      right: true,
    },
    {
      name: "Discount",
      selector: (row) =>
        `₱${row.discount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
      sortable: true,
      right: true,
    },
    {
      name: "Net Price",
      selector: (row) =>
        `₱${row.netPrice.toLocaleString(undefined, {
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
              : row.status === "Overdue"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Update filtered data when invoices change
  useEffect(() => {
    setFilteredData(invoices);
  }, [invoices]);

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(invoices).filter((row) =>
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
