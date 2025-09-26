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
      grow: 1,
      minWidth: "150px",
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.date).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
      sortable: true,
      grow: 0,
      width: "100px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      grow: 1,
      minWidth: "200px",
      wrap: true,
    },
    // {
    //   name: "Address",
    //   selector: (row) => row.customerAddress,
    //   sortable: true,
    //   grow: 0,
    //   minWidth: "180px",
    //   maxWidth: "250px",
    //   wrap: true,
    // },
    // {
    //   name: "Number",
    //   selector: (row) => row.customerNumber,
    //   sortable: true,
    //   grow: 0,
    //   width: "140px",
    // },
    {
      name: "PIC",
      selector: (row) => row.salesAgent,
      sortable: true,
      grow: 0,
      width: "140px",
    },
    {
      name: "Waybill Number",
      cell: (row) => {
        return (
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control border border-secondary"
            />

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
      grow: 1,
      minWidth: "150px",
    },
  ];

  const API_URL = import.meta.env.VITE_API_URL;

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
        `${API_URL}/packing-list/invoice-final`,
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
        `${API_URL}/delivery-receipts/${type}`,
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
      .put(`${API_URL}/invoice/${row.invoiceID}/status`, {
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
          .delete(`${API_URL}/invoice/${row.invoiceID}`)
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
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div
                className="modal-header text-white position-relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  cursor: "move", // so it's clear this is draggable
                }}
              >
                <div className="w-100 d-flex flex-column">
                  {/* Breadcrumb + Close */}
                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <p className="mb-2 opacity-75 small">Sales &gt; Invoice</p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowRowModal(false)}
                    ></button>
                  </div>

                  {/* Invoice Title + Action Buttons */}
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      Invoice ID: {selectedRow.invoiceID || selectedRow.orderId}
                    </h5>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{
                          color: "#0C1D61",
                        }}
                        onClick={() => handlePrintDR("a", selectedRow)}
                      >
                        DR1
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{
                          color: "#0C1D61",
                        }}
                        onClick={() => handlePrintDR("b", selectedRow)}
                      >
                        DR2
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{
                          color: "#0C1D61",
                        }}
                        onClick={() => handlePrint(selectedRow)}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative circles */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-50px",
                    right: "-50px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-30px",
                    left: "-30px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                  }}
                ></div>
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
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            {/* Item Name */}
                            <div className="d-flex align-items-center gap-3">
                              <span className="fw-semibold">
                                {item.itemName}
                              </span>
                            </div>

                            {/* Price and Quantity */}
                            <div className="d-flex flex-column justify-content-center text-end">
                              <span className="fw-semibold">
                                ₱
                                {(item.price * item.quantity).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                  }
                                )}
                              </span>
                              <small className="text-muted">
                                Qty: {item.quantity}
                              </small>
                            </div>
                          </div>

                          {/* Divider */}
                          {index <
                            (
                              selectedRow.orderedItems ||
                              selectedRow.items ||
                              []
                            ).length -
                              1 && <hr className="my-0 border-secondary" />}
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

      <div>
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
