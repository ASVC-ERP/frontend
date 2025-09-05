import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import defaultPic from "../../assets/defaultPic.jpg";
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
      // Prepare payload
      const payload = {
        invoiceID: selectedRow.invoiceID,
        date: selectedRow.date,
        customerName: selectedRow.customerName,
        customerAddress: selectedRow.customerAddress,
        items: selectedRow.items, // send items array as-is
      };

      const response = await axios.post(
        'http://localhost:3000/packing-list/invoice-final',
        payload,
        { responseType: 'blob' } // important for PDF
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      Swal.fire({
        icon: 'error',
        title: 'Print Failed',
        text: 'Failed to generate PDF. See console for details.',
      });
    }
  };

  // Frontend example for Delivery Receipt A
  const handlePrintDR = async (type, selectedRow) => {
    if (!selectedRow) return;

    try {
      // type should be 'a' or 'b'
      const response = await axios.post(
        `http://localhost:3000/delivery-receipts/${type}`,
        selectedRow,
        { responseType: 'blob' } // important for PDF
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      Swal.fire({
        icon: 'error',
        title: 'Print Failed',
        text: 'Failed to generate PDF. See console for details.',
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
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex flex-column align-items-start">
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <p className="mb-2" style={{ color: "#05050599", fontSize: "12px" }}>
                    Sales &gt; Invoice &gt; {selectedRow.invoiceId || selectedRow.orderId}
                  </p>
                  <button type="button" className="btn-close" onClick={() => setShowRowModal(false)}></button>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                    Invoice ID: {selectedRow.invoiceId || selectedRow.orderId}
                  </h5>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => handlePrintDR('a', selectedRow)}
                    >
                      DR1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => handlePrintDR('b', selectedRow)}
                    >
                      DR2
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => handlePrint(selectedRow)}
                    >
                      Print
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-body">
                <div className="rounded-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                  <ul className="list-unstyled">
                    {(selectedRow.orderedItems || selectedRow.items || []).map((item, index) => (
                      <li key={index}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={defaultPic}
                              alt="Product"
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                            />
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{item.itemName}</span>
                            </div>
                          </div>
                          <div className="text-end d-flex flex-column">
                            <span className="fw-semibold">
                              ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                  <span className="h5 fw-semibold">Total</span>
                  <span className="fw-bold h5">
                    ₱
                    {(selectedRow.totalPrice || (selectedRow.orderedItems || selectedRow.items || []).reduce(
                      (sum, item) => sum + (item.price * item.quantity), 0
                    )).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>{selectedRow.customerName}</p>
                  <p className="mb-0 small">{selectedRow.customerAddress}</p>
                  <p className="mb-0 small">{selectedRow.customerNumber}</p>
                </div>
                <p className="text-muted small mb-0">
                  {new Date(selectedRow.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
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
