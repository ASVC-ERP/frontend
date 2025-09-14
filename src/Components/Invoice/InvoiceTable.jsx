import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import defaultPic from "../../assets/defaultPic.jpg";
import { Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

function InvoiceTable({ invoices, fetchInvoices }) {
  const columns = [
    {
      name: "Invoice ID",
      selector: (row) => row.invoiceID,
      sortable: true,
      maxwidth: "50px",
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
    },
    {
      name: "Customer Address",
      selector: (row) => row.customerAddress,
      sortable: true,
    },
    {
      name: "Customer Number",
      selector: (row) => row.customerNumber,
      sortable: true,
    },
    {
      name: "Sales Agent",
      selector: (row) => row.salesAgent,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => {
        const effectiveStatus = pendingChanges[row.invoiceID] ?? row.status;

        return (
          <div className="d-flex align-items-center gap-2">
            <Dropdown onClick={(e) => e.stopPropagation()}>
              <Dropdown.Toggle
                size="sm"
                variant="secondary"
                className={`badge ${
                  effectiveStatus === "Pending"
                    ? "bg-secondary"
                    : effectiveStatus === "Out For Delivery"
                    ? "bg-warning text-dark"
                    : effectiveStatus === "Delivered"
                    ? "bg-success"
                    : "bg-dark"
                }`}
              >
                {effectiveStatus}
              </Dropdown.Toggle>

              <Dropdown.Menu container={document.body}>
                <Dropdown.Item
                  onClick={() => handleStatusChange(row, "Pending")}
                >
                  <span className="badge bg-secondary">Pending</span>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleStatusChange(row, "Out For Delivery")}
                >
                  <span className="badge bg-warning text-dark">
                    Out For Delivery
                  </span>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleStatusChange(row, "Delivered")}
                >
                  <span className="badge bg-success">Delivered</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button
              variant="outline-success"
              size="sm"
              className="p-1 d-flex align-items-center justify-content-center"
              onClick={(e) => {
                e.stopPropagation();
                handleSave(row);
              }}
              title="Save"
            >
              <FaSave size={14} />
            </Button>

            {/* Delete button */}
            <Button
              variant="outline-danger"
              size="sm"
              className="p-1 d-flex align-items-center justify-content-center"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              title="Delete"
            >
              🗑️
            </Button>
          </div>
        );
      },
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      fetchInvoices();
    }, 10000); // every 10 seconds

    setFilteredData(invoices);

    return () => clearInterval(interval);
  }, [fetchInvoices]);

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
        "http://localhost:3000/packing-list/invoice-final",
        payload,
        { responseType: "blob" } // important for PDF
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      Swal.fire({
        icon: "error",
        title: "Print Failed",
        text: "Failed to generate PDF. See console for details.",
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
        { responseType: "blob" } // important for PDF
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      Swal.fire({
        icon: "error",
        title: "Print Failed",
        text: "Failed to generate PDF. See console for details.",
      });
    }
  };

  const handleStatusChange = (row, newStatus) => {
    // Just update local pending changes
    setPendingChanges((prev) => ({
      ...prev,
      [row.invoiceID]: newStatus,
    }));
  };

  const handleSave = (row) => {
    const newStatus = pendingChanges[row.invoiceID];
    if (!newStatus) return;

    axios
      .put(`http://localhost:3000/invoice/${row.invoiceID}/status`, {
        status: newStatus,
      })
      .then(() => {
        const updatedData = filteredData.map((item) =>
          item.invoiceID === row.invoiceID
            ? { ...item, status: newStatus }
            : item
        );
        setFilteredData(updatedData);
        setPendingChanges((prev) => {
          const copy = { ...prev };
          delete copy[row.invoiceID];
          return copy;
        });

        fetchInvoices();
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Invoice ${row.invoiceID} marked as ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error("Failed to update status:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Could not update invoice status.",
        });
      });
  };

  const handleDelete = (row) => {
    Swal.fire({
      icon: "warning",
      title: "Delete Invoice",
      text: `Are you sure you want to delete invoice ${row.invoiceID}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3000/invoice/${row.invoiceID}`)
          .then((res) => {
            // Remove invoice from table
            setFilteredData((prev) =>
              prev.filter((item) => item.invoiceID !== row.invoiceID)
            );

            fetchInvoices();

            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `Invoice ${row.invoiceID} has been deleted and items returned to stock.`,
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            console.error("Failed to delete invoice:", err);
            Swal.fire({
              icon: "error",
              title: "Delete Failed",
              text: "Could not delete invoice. See console for details.",
            });
          });
      }
    });
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
                  <p
                    className="mb-2"
                    style={{ color: "#05050599", fontSize: "12px" }}
                  >
                    Sales &gt; Invoice &gt;{" "}
                    {selectedRow.invoiceId || selectedRow.orderId}
                  </p>
                  <button
                    type="button"
                    className="btn-close p-4"
                    onClick={() => setShowRowModal(false)}
                  ></button>
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
                      onClick={() => handlePrintDR("a", selectedRow)}
                    >
                      DR1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => handlePrintDR("b", selectedRow)}
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
                <div
                  className="rounded-3"
                  style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                  <ul className="list-unstyled">
                    {(selectedRow.orderedItems || selectedRow.items || []).map(
                      (item, index) => (
                        <li key={index}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={defaultPic}
                                alt="Product"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                }}
                              />
                              <div className="d-flex flex-column">
                                <span className="fw-semibold">
                                  {item.itemName}
                                </span>
                              </div>
                            </div>
                            <div className="text-end d-flex flex-column">
                              <span className="fw-semibold">
                                ₱
                                {(item.price * item.quantity).toLocaleString(
                                  undefined,
                                  { minimumFractionDigits: 2 }
                                )}
                              </span>
                              <small className="text-muted">
                                Qty: {item.quantity}
                              </small>
                            </div>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                  <span className="h5 fw-semibold">Total</span>
                  <span className="fw-bold h5">
                    ₱
                    {(
                      selectedRow.totalPrice ||
                      (
                        selectedRow.orderedItems ||
                        selectedRow.items ||
                        []
                      ).reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>
                    {selectedRow.customerName}
                  </p>
                  <p className="mb-0 small">{selectedRow.customerAddress}</p>
                  <p className="mb-0 small">{selectedRow.customerNumber}</p>
                </div>
                <p className="text-muted small mb-0">
                  {new Date(selectedRow.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
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
    </div>
  );
}

export default InvoiceTable;
