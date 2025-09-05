import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import axios from 'axios';
import Swal from "sweetalert2";

function InvoiceTable({ invoices }) {
  const columns = [
    {
      name: "Invoice ID",
      selector: row => row.invoiceID,
      sortable: true,
    },
    {
      name: "Date",
      selector: row =>
        new Date(row.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: row => row.customerName,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Customer Address",
      selector: row => row.customerAddress,
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "Customer Number",
      selector: row => row.customerNumber,
      sortable: true,
    },
    {
      name: "Sales Agent",
      selector: row => row.salesAgent,
      sortable: true,
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      cell: row => (
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [showRowModal, setShowRowModal] = useState(false);

  useEffect(() => {
    setFilteredData(invoices);
  }, [invoices]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = invoices.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleRowClick = (row) => {
    setSelectedRow({
      ...row,
      items: Array.isArray(row.items) ? [...row.items] : [],
    });
    setShowRowModal(true);
  };

  const getInvoiceTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

const handlePrint = async () => {
  if (!selectedRow) return;

  try {
    // Construct proper payload
    const payload = {
      invoiceID: selectedRow.invoiceID,
      date: selectedRow.date,
      customerName: selectedRow.customerName,
      customerAddress: selectedRow.customerAddress,
      customerNumber: selectedRow.customerNumber,
      salesAgent: selectedRow.salesAgent,
      status: selectedRow.status,
      items: selectedRow.items.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice || item.price * item.quantity,
      })),
      totalPrice: selectedRow.items.reduce(
        (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
        0
      ),
    };

    const response = await axios.post(
      "http://localhost:3000/packing-list/invoice",
      payload,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Failed to generate PDF:", err);
    Swal.fire({
      icon: "error",
      title: "Print Failed",
      text: "Failed to generate PDF. See console for details.",
    });
  }
};


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <div className="position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search invoices"
            value={searchTerm}
            onChange={handleSearch}
            className="form-control ps-5 border-2 rounded-3"
          />
        </div>
      </div>

      {/* Row Modal */}
      {showRowModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex flex-column align-items-start">
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <p
                    className="mb-2"
                    style={{ color: "#05050599", fontSize: "12px" }}
                  >
                    Sales &gt; Invoice &gt; {selectedRow.invoiceID}
                  </p>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRowModal(false)}
                  ></button>
                </div>
                <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                  Invoice ID: {selectedRow.invoiceID}
                </h5>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: "#0C1D61", color: "white" }}
                  onClick={() => handlePrint(true)}
                >
                  Print
                </button>
              </div>

              <div className="modal-body">
                <p>
                  Customer: {selectedRow.customerName} <br />
                  Date: {new Date(selectedRow.date).toLocaleDateString("en-GB")} <br />
                  Status: {selectedRow.status}
                </p>

                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRow.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>₱{item.price.toLocaleString()}</td>
                        <td>₱{(item.totalPrice || (item.price * item.quantity)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-end mt-3">
                  <strong>Total: ₱{getInvoiceTotal(selectedRow.items).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredData}
        onRowClicked={handleRowClick}
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
